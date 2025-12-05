metadata name = 'Document Intelligence Module'
metadata description = 'This module deploys Azure AI Services for Document Intelligence.'

@description('Required. The name of the AI Services account.')
param name string

@description('Required. Kind of the AI Services account.')
@allowed([
  'AIServices'
  'CognitiveServices'
  'OpenAI'
  'FormRecognizer'
])
param kind string

@description('Optional. SKU of the AI Services account.')
@allowed([
  'F0'
  'S0'
])
param sku string = 'S0'

@description('Optional. Location for all Resources.')
param location string = resourceGroup().location

@description('Optional. Whether or not public network access is allowed.')
@allowed([
  'Enabled'
  'Disabled'
])
param publicNetworkAccess string?

@description('Conditional. Subdomain name used for token-based authentication.')
param customSubDomainName string?

@description('Optional. A collection of rules governing the accessibility from specific network locations.')
param networkAcls object?

import { roleAssignmentType } from 'br/public:avm/utl/types/avm-common-types:0.5.1'
@description('Optional. Array of role assignments to create.')
param roleAssignments roleAssignmentType[]?

@description('Optional. Tags of the resource.')
param tags object?

@description('Optional. Allow only Azure AD authentication.')
param disableLocalAuth bool = true

@description('Optional. Enable/Disable usage telemetry for module.')
param enableTelemetry bool = true

@description('Optional. Array of deployments about AI service accounts to create.')
param deployments array?

module avmAiServices 'br/public:avm/res/cognitive-services/account:0.11.0' = {
  name: take('avm.res.cognitive-services.account.${name}', 64)
  params: {
    name: name
    kind: kind
    location: location
    sku: sku
    tags: tags
    customSubDomainName: customSubDomainName
    publicNetworkAccess: publicNetworkAccess
    networkAcls: networkAcls
    disableLocalAuth: disableLocalAuth
    enableTelemetry: enableTelemetry
    deployments: deployments
    roleAssignments: roleAssignments
    managedIdentities: {
      systemAssigned: true
    }
  }
}

@description('The name of the AI services account.')
output name string = avmAiServices.outputs.name

@description('The resource ID of the AI services account.')
output resourceId string = avmAiServices.outputs.resourceId

@description('The service endpoint of the AI services account.')
output endpoint string = avmAiServices.outputs.endpoint

@description('The principal ID of the system assigned identity.')
output systemAssignedMIPrincipalId string? = avmAiServices.outputs.?systemAssignedMIPrincipalId

@description('The location the resource was deployed into.')
output location string = avmAiServices.outputs.location
