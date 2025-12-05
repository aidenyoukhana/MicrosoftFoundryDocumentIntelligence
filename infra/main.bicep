// ========== main.bicep ========== //
targetScope = 'resourceGroup'

metadata name = 'Microsoft Foundry Document Intelligence Solution'
metadata description = 'Bicep template to deploy the Document Intelligence Solution with Azure AI Foundry.'

// ========== Parameters ========== //
@description('Required. Name of the solution to deploy.')
param solutionName string = 'docint'

@description('Optional. Location for all Resources.')
param location string = resourceGroup().location

@minLength(1)
@description('Location for the Azure AI Document Intelligence service deployment:')
@allowed(['eastus', 'westus2', 'westeurope', 'northeurope'])
@metadata({
  azd: {
    type: 'location'
  }
})
param documentIntelligenceLocation string = 'eastus'

@metadata({
  azd: {
    type: 'location'
    usageName: [
      'OpenAI.GlobalStandard.gpt-4o,10'
    ]
  }
})
param aiServiceLocation string

@description('Optional. Type of GPT deployment to use: Standard | GlobalStandard.')
@minLength(1)
@allowed([
  'Standard'
  'GlobalStandard'
])
param deploymentType string = 'GlobalStandard'

@description('Optional. Name of the GPT model to deploy: gpt-4o-mini | gpt-4o | gpt-4.')
param gptModelName string = 'gpt-4o'

@minLength(1)
@description('Optional. Version of the GPT model to deploy.')
@allowed([
  '2024-08-06'
])
param gptModelVersion string = '2024-08-06'

@minValue(1)
@description('Required. Capacity of the GPT deployment (minimum 10).')
param gptDeploymentCapacity int = 10

@description('Optional. Location used for Azure Cosmos DB, Azure Container App deployment.')
param secondaryLocation string = (location == 'eastus2') ? 'westus2' : 'eastus2'

@description('Optional. Enable/Disable usage telemetry for module.')
param enableTelemetry bool = true

@description('Optional. Tags to be applied to the resources.')
param tags object = {
  app: 'Document Intelligence Solution'
  location: resourceGroup().location
}

@maxLength(5)
@description('Optional. A unique text value for the solution.')
param solutionUniqueText string = substring(uniqueString(subscription().id, resourceGroup().name, solutionName), 0, 5)

var solutionSuffix = toLower(trim(replace(
  replace(
    replace(replace(replace(replace('${solutionName}${solutionUniqueText}', '-', ''), '_', ''), '.', ''), '/', ''),
    ' ',
    ''
  ),
  '*',
  ''
)))

// ========== Managed Identity ========== //
module avmManagedIdentity './modules/managed-identity.bicep' = {
  name: take('module.managed-identity.${solutionSuffix}', 64)
  params: {
    name: 'id-${solutionSuffix}'
    location: location
    tags: tags
  }
}

// ========== Key Vault Module ========== //
module avmKeyVault './modules/key-vault.bicep' = {
  name: take('module.key-vault.${solutionSuffix}', 64)
  params: {
    keyvaultName: 'kv-${solutionSuffix}'
    location: location
    tags: tags
    roleAssignments: [
      {
        principalId: avmManagedIdentity.outputs.principalId
        roleDefinitionIdOrName: 'Key Vault Administrator'
        principalType: 'ServicePrincipal'
      }
    ]
    enablePurgeProtection: false
    enableSoftDelete: true
    keyvaultsku: 'standard'
    enableRbacAuthorization: true
    createMode: 'default'
    enableTelemetry: enableTelemetry
    enableVaultForDiskEncryption: true
    enableVaultForTemplateDeployment: true
    softDeleteRetentionInDays: 7
    publicNetworkAccess: 'Enabled'
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Deny'
    }
  }
}

// ========== Managed Identity for Container Registry ========== //
module avmContainerRegistryReader 'br/public:avm/res/managed-identity/user-assigned-identity:0.4.1' = {
  name: take('avm.res.managed-identity.user-assigned-identity.${solutionSuffix}', 64)
  params: {
    name: 'id-acr-${solutionSuffix}'
    location: location
    tags: tags
    enableTelemetry: enableTelemetry
  }
}

// ========== Container Registry ========== //
module avmContainerRegistry './modules/container-registry.bicep' = {
  name: take('module.container-registry.${solutionSuffix}', 64)
  params: {
    acrName: 'cr${replace(solutionSuffix, '-', '')}'
    location: location
    acrSku: 'Standard'
    publicNetworkAccess: 'Enabled'
    zoneRedundancy: 'Disabled'
    roleAssignments: [
      {
        principalId: avmContainerRegistryReader.outputs.principalId
        roleDefinitionIdOrName: 'AcrPull'
        principalType: 'ServicePrincipal'
      }
    ]
    tags: tags
  }
}

// ========== Container App Environment ========== //
module avmContainerAppEnv 'br/public:avm/res/app/managed-environment:0.11.2' = {
  name: take('avm.res.app.managed-environment.${solutionSuffix}', 64)
  params: {
    name: 'cae-${solutionSuffix}'
    location: location
    tags: {
      app: solutionSuffix
      location: location
    }
    managedIdentities: { systemAssigned: true }
    workloadProfiles: [
      {
        name: 'Consumption'
        workloadProfileType: 'Consumption'
      }
    ]
    enableTelemetry: enableTelemetry
    publicNetworkAccess: 'Enabled'
    platformReservedCidr: '172.17.17.0/24'
    platformReservedDnsIP: '172.17.17.17'
  }
}

// ========== Container App API (Initial Deployment) ========== //
module avmContainerApp_API 'br/public:avm/res/app/container-app:0.17.0' = {
  name: take('avm.res.app.container-app-api.${solutionSuffix}', 64)
  params: {
    name: 'ca-${solutionSuffix}-api'
    location: location
    environmentResourceId: avmContainerAppEnv.outputs.resourceId
    workloadProfileName: 'Consumption'
    enableTelemetry: enableTelemetry
    registries: null
    tags: tags
    managedIdentities: {
      systemAssigned: true
      userAssignedResourceIds: [
        avmContainerRegistryReader.outputs.resourceId
      ]
    }
    containers: [
      {
        name: 'ca-${solutionSuffix}-api'
        image: 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
        resources: {
          cpu: '2'
          memory: '4.0Gi'
        }
        env: [
          {
            name: 'APP_ENV'
            value: 'prod'
          }
        ]
        probes: [
          {
            type: 'Liveness'
            httpGet: {
              path: '/'
              port: 80
              scheme: 'HTTP'
            }
            initialDelaySeconds: 5
            periodSeconds: 10
            failureThreshold: 3
          }
          {
            type: 'Readiness'
            httpGet: {
              path: '/'
              port: 80
              scheme: 'HTTP'
            }
            initialDelaySeconds: 5
            periodSeconds: 10
            failureThreshold: 3
          }
        ]
      }
    ]
    scaleSettings: {
      maxReplicas: 3
      minReplicas: 1
      rules: [
        {
          name: 'http-scaler'
          http: {
            metadata: {
              concurrentRequests: '100'
            }
          }
        }
      ]
    }
    ingressExternal: true
    activeRevisionsMode: 'Single'
    ingressTransport: 'auto'
    corsPolicy: {
      allowedOrigins: [
        '*'
      ]
      allowedMethods: [
        'GET'
        'POST'
        'PUT'
        'DELETE'
        'OPTIONS'
      ]
      allowedHeaders: [
        'Authorization'
        'Content-Type'
        '*'
      ]
    }
  }
}

// ========== Container App Web ========== //
module avmContainerApp_Web 'br/public:avm/res/app/container-app:0.17.0' = {
  name: take('avm.res.app.container-app-web.${solutionSuffix}', 64)
  params: {
    name: 'ca-${solutionSuffix}-web'
    location: location
    environmentResourceId: avmContainerAppEnv.outputs.resourceId
    workloadProfileName: 'Consumption'
    enableTelemetry: enableTelemetry
    registries: null
    tags: tags
    managedIdentities: {
      systemAssigned: true
      userAssignedResourceIds: [
        avmContainerRegistryReader.outputs.resourceId
      ]
    }
    ingressExternal: true
    activeRevisionsMode: 'Single'
    ingressTransport: 'auto'
    scaleSettings: {
      maxReplicas: 3
      minReplicas: 1
      rules: [
        {
          name: 'http-scaler'
          http: {
            metadata: {
              concurrentRequests: '100'
            }
          }
        }
      ]
    }
    containers: [
      {
        name: 'ca-${solutionSuffix}-web'
        image: 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
        resources: {
          cpu: '1'
          memory: '2.0Gi'
        }
        env: [
          {
            name: 'REACT_APP_API_BASE_URL'
            value: 'https://${avmContainerApp_API.outputs.fqdn}'
          }
        ]
      }
    ]
  }
}

// ========== Storage Account ========== //
// Note: Role assignments are done after Container Apps are created
module avmStorageAccount 'br/public:avm/res/storage/storage-account:0.20.0' = {
  name: take('module.storage-account.${solutionSuffix}', 64)
  params: {
    name: 'st${replace(solutionSuffix, '-', '')}'
    location: location
    managedIdentities: { systemAssigned: true }
    minimumTlsVersion: 'TLS1_2'
    enableTelemetry: enableTelemetry
    roleAssignments: [
      {
        principalId: avmManagedIdentity.outputs.principalId
        roleDefinitionIdOrName: 'Storage Blob Data Contributor'
        principalType: 'ServicePrincipal'
      }
      {
        roleDefinitionIdOrName: 'Storage Blob Data Contributor'
        principalId: avmContainerApp_API.outputs.systemAssignedMIPrincipalId!
        principalType: 'ServicePrincipal'
      }
      {
        roleDefinitionIdOrName: 'Storage Queue Data Contributor'
        principalId: avmContainerApp_API.outputs.systemAssignedMIPrincipalId!
        principalType: 'ServicePrincipal'
      }
    ]
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Allow'
    }
    supportsHttpsTrafficOnly: true
    accessTier: 'Hot'
    tags: tags
    allowBlobPublicAccess: false
    publicNetworkAccess: 'Enabled'
    blobServices: {
      containers: [
        {
          name: 'documents'
          publicAccess: 'None'
        }
        {
          name: 'processed'
          publicAccess: 'None'
        }
      ]
    }
    queueServices: {
      queues: [
        {
          name: 'document-processing-queue'
        }
      ]
    }
  }
  dependsOn: [
    avmContainerApp_API
  ]
}

// ========== AI Services (OpenAI) ========== //
module avmAiServices './modules/account/document-intelligence.bicep' = {
  name: take('module.ai-services.${solutionSuffix}', 64)
  params: {
    name: 'ai-${solutionSuffix}'
    location: aiServiceLocation
    sku: 'S0'
    kind: 'AIServices'
    tags: {
      app: solutionSuffix
      location: aiServiceLocation
    }
    customSubDomainName: 'ai-${solutionSuffix}'
    roleAssignments: [
      {
        principalId: avmManagedIdentity.outputs.principalId
        roleDefinitionIdOrName: '8e3af657-a8ff-443c-a75c-2fe8c4bcb635' // Owner role
        principalType: 'ServicePrincipal'
      }
      {
        principalId: avmContainerApp_API.outputs.systemAssignedMIPrincipalId!
        roleDefinitionIdOrName: 'Cognitive Services OpenAI User'
        principalType: 'ServicePrincipal'
      }
    ]
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Allow'
    }
    disableLocalAuth: true
    enableTelemetry: enableTelemetry
    deployments: [
      {
        name: gptModelName
        model: {
          format: 'OpenAI'
          name: gptModelName
          version: gptModelVersion
        }
        sku: {
          name: deploymentType
          capacity: gptDeploymentCapacity
        }
        raiPolicyName: 'Microsoft.Default'
      }
    ]
    publicNetworkAccess: 'Enabled'
  }
  dependsOn: [
    avmContainerApp_API
  ]
}

// ========== Document Intelligence Service ========== //
module avmDocumentIntelligence 'br/public:avm/res/cognitive-services/account:0.11.0' = {
  name: take('avm.res.cognitive-services.document-intelligence.${solutionSuffix}', 64)
  params: {
    name: 'di-${solutionSuffix}'
    location: documentIntelligenceLocation
    sku: 'S0'
    kind: 'FormRecognizer'
    tags: {
      app: solutionSuffix
      location: documentIntelligenceLocation
    }
    customSubDomainName: 'di-${solutionSuffix}'
    disableLocalAuth: false
    enableTelemetry: enableTelemetry
    networkAcls: {
      bypass: 'AzureServices'
      defaultAction: 'Allow'
    }
    managedIdentities: {
      systemAssigned: true
    }
    roleAssignments: [
      {
        principalId: avmContainerApp_API.outputs.systemAssignedMIPrincipalId!
        roleDefinitionIdOrName: 'Cognitive Services User'
        principalType: 'ServicePrincipal'
      }
    ]
    publicNetworkAccess: 'Enabled'
  }
  dependsOn: [
    avmContainerApp_API
  ]
}

// ========== Cosmos DB for Document Metadata ========== //
module avmCosmosDB 'br/public:avm/res/document-db/database-account:0.15.0' = {
  name: take('avm.res.document-db.database-account.${solutionSuffix}', 64)
  params: {
    name: 'cosmos-${solutionSuffix}'
    location: location
    mongodbDatabases: [
      {
        name: 'documentdb'
        tag: 'document intelligence database'
      }
    ]
    tags: tags
    enableTelemetry: enableTelemetry
    databaseAccountOfferType: 'Standard'
    automaticFailover: false
    serverVersion: '7.0'
    capabilitiesToAdd: [
      'EnableMongo'
    ]
    enableAnalyticalStorage: true
    defaultConsistencyLevel: 'Session'
    maxIntervalInSeconds: 5
    maxStalenessPrefix: 100
    zoneRedundant: false
    networkRestrictions: {
      publicNetworkAccess: 'Enabled'
      ipRules: []
      virtualNetworkRules: []
    }
  }
}

// ========== App Configuration ========== //
module avmAppConfig 'br/public:avm/res/app-configuration/configuration-store:0.6.3' = {
  name: take('avm.res.app.configuration-store.${solutionSuffix}', 64)
  params: {
    name: 'appcs-${solutionSuffix}'
    location: location
    enablePurgeProtection: false
    tags: {
      app: solutionSuffix
      location: location
    }
    enableTelemetry: enableTelemetry
    managedIdentities: { systemAssigned: true }
    sku: 'Standard'
    disableLocalAuth: false
    replicaLocations: (location != secondaryLocation) ? [secondaryLocation] : []
    roleAssignments: [
      {
        principalId: avmContainerApp_API.outputs.systemAssignedMIPrincipalId!
        roleDefinitionIdOrName: 'App Configuration Data Reader'
        principalType: 'ServicePrincipal'
      }
      {
        principalId: avmContainerApp_Web.outputs.systemAssignedMIPrincipalId!
        roleDefinitionIdOrName: 'App Configuration Data Reader'
        principalType: 'ServicePrincipal'
      }
    ]
    keyValues: [
      {
        name: 'APP_AZURE_OPENAI_ENDPOINT'
        value: avmAiServices.outputs.endpoint
      }
      {
        name: 'APP_AZURE_OPENAI_MODEL'
        value: gptModelName
      }
      {
        name: 'APP_DOCUMENT_INTELLIGENCE_ENDPOINT'
        value: avmDocumentIntelligence.outputs.endpoint
      }
      {
        name: 'APP_COSMOS_DATABASE'
        value: 'documentdb'
      }
      {
        name: 'APP_COSMOS_CONTAINER_DOCUMENTS'
        value: 'Documents'
      }
      {
        name: 'APP_STORAGE_BLOB_URL'
        value: avmStorageAccount.outputs.serviceEndpoints.blob
      }
      {
        name: 'APP_STORAGE_QUEUE_URL'
        value: avmStorageAccount.outputs.serviceEndpoints.queue
      }
      {
        name: 'APP_COSMOS_CONNSTR'
        value: avmCosmosDB.outputs.primaryReadWriteConnectionString
      }
    ]
    publicNetworkAccess: 'Enabled'
  }
  dependsOn: [
    avmContainerApp_API
    avmContainerApp_Web
    avmAiServices
    avmDocumentIntelligence
    avmStorageAccount
    avmCosmosDB
  ]
}

// ============ //
// Outputs      //
// ============ //

@description('The name of the Container App used for Web App.')
output CONTAINER_WEB_APP_NAME string = avmContainerApp_Web.outputs.name

@description('The name of the Container App used for API.')
output CONTAINER_API_APP_NAME string = avmContainerApp_API.outputs.name

@description('The FQDN of the Container App Web.')
output CONTAINER_WEB_APP_FQDN string = avmContainerApp_Web.outputs.fqdn

@description('The FQDN of the Container App API.')
output CONTAINER_API_APP_FQDN string = avmContainerApp_API.outputs.fqdn

@description('The name of the Azure Container Registry.')
output CONTAINER_REGISTRY_NAME string = avmContainerRegistry.outputs.name

@description('The login server of the Azure Container Registry.')
output CONTAINER_REGISTRY_LOGIN_SERVER string = avmContainerRegistry.outputs.loginServer

@description('The resource group the resources were deployed into.')
output AZURE_RESOURCE_GROUP string = resourceGroup().name

@description('The Document Intelligence endpoint.')
output DOCUMENT_INTELLIGENCE_ENDPOINT string = avmDocumentIntelligence.outputs.endpoint

@description('The Azure OpenAI endpoint.')
output AZURE_OPENAI_ENDPOINT string = avmAiServices.outputs.endpoint

@description('The Storage Account blob endpoint.')
output STORAGE_BLOB_ENDPOINT string = avmStorageAccount.outputs.serviceEndpoints.blob
