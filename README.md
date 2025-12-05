# Microsoft Foundry Document Intelligence

A React-based document management system that uses Microsoft Azure AI Foundry for intelligent document processing, classification, and data extraction.

## Solution Overview

This solution provides a comprehensive document processing platform that leverages Azure AI services for:

- **Document Upload**: Drag-and-drop interface for uploading documents (PDF, images, Word documents)
- **AI-Powered Analysis**: Automatic document classification and field extraction using Azure Document Intelligence
- **Document History**: Browse, search, and manage all processed documents
- **Confidence Scoring**: View extraction confidence scores for each field
- **Real-time Processing**: Track document processing status in real-time

### Solution Architecture

| Component | Description |
|-----------|-------------|
| React Web App | Modern React frontend with Fluent UI components |
| API Backend | Azure Container Apps backend API |
| Document Intelligence | Azure AI Document Intelligence for OCR and extraction |
| Azure OpenAI | GPT models for enhanced document understanding |
| Azure Storage | Blob storage for documents and queue for processing |
| Cosmos DB | MongoDB-compatible database for document metadata |
| Azure Container Apps | Scalable container hosting for web and API |

## Quick Deploy

### Prerequisites

- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- [Azure Developer CLI (azd)](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/install-azd) version 1.18.0 or higher
- [Node.js](https://nodejs.org/) 18.x or higher
- An Azure subscription with the following permissions:
  - Create resource groups and resources
  - Assign roles at the resource group level

### Deployment Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/aidenyoukhana/MicrosoftFoundryDocumentIntelligence.git
   cd MicrosoftFoundryDocumentIntelligence
   ```

2. **Login to Azure**
   ```bash
   azd auth login
   ```

3. **Initialize the environment**
   ```bash
   azd init
   ```

4. **Configure environment variables**
   
   Create a `.env` file or set the following environment variables:
   ```bash
   AZURE_ENV_NAME=docint
   AZURE_ENV_SECONDARY_LOCATION=westus2
   AZURE_ENV_DI_LOCATION=eastus
   AZURE_ENV_AI_DEPLOYMENTS_LOCATION=eastus
   AZURE_ENV_MODEL_DEPLOYMENT_TYPE=GlobalStandard
   AZURE_ENV_MODEL_NAME=gpt-4o
   AZURE_ENV_MODEL_VERSION=2024-08-06
   AZURE_ENV_MODEL_CAPACITY=10
   ```

5. **Deploy to Azure**
   ```bash
   azd up
   ```

6. **Access the application**
   
   After deployment, the web app URL will be displayed. Navigate to the URL to start using the application.

## Local Development

### Running the Web App Locally

1. **Navigate to the web directory**
   ```bash
   cd src/web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file:
   ```bash
   REACT_APP_API_BASE_URL=http://localhost:8080/api
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open the app**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
cd src/web
npm run build
```

The built files will be in the `build` directory.

## Project Structure

```
├── azure.yaml              # Azure Developer CLI configuration
├── infra/                  # Bicep infrastructure templates
│   ├── main.bicep          # Main deployment template
│   ├── main.parameters.json # Parameter file
│   └── modules/            # Reusable Bicep modules
│       ├── account/
│       │   └── document-intelligence.bicep
│       ├── container-registry.bicep
│       ├── key-vault.bicep
│       └── managed-identity.bicep
├── src/
│   └── web/                # React web application
│       ├── public/         # Static assets
│       └── src/
│           ├── components/ # Reusable UI components
│           ├── pages/      # Page components
│           ├── services/   # API services
│           ├── store/      # Redux store and slices
│           ├── styles/     # CSS styles
│           └── types/      # TypeScript type definitions
└── README.md
```

## Key Features

### Document Upload
- Drag-and-drop file upload
- Support for PDF, PNG, JPG, JPEG, TIFF, BMP, DOC, DOCX formats
- Progress tracking during upload
- Batch upload support

### Document Analysis
- Automatic document type detection
- Field extraction with confidence scores
- Table and form recognition
- Raw text extraction

### Document Management
- Full document history
- Search and filter capabilities
- Document status tracking (pending, processing, completed, failed)
- Detailed document view with analysis results

## Azure Resources

The deployment creates the following Azure resources:

| Resource | Purpose |
|----------|---------|
| Azure AI Services | OpenAI GPT models for document understanding |
| Azure Document Intelligence | Document OCR and field extraction |
| Azure Container Apps | Hosting for web and API containers |
| Azure Container Registry | Container image storage |
| Azure Storage Account | Document blob storage and processing queues |
| Azure Cosmos DB | Document metadata storage (MongoDB API) |
| Azure Key Vault | Secrets management |
| Azure App Configuration | Application configuration |
| Managed Identity | Secure service-to-service authentication |

## Costs

Use the [Azure Pricing Calculator](https://azure.microsoft.com/pricing/calculator/) to estimate costs for your deployment. Key cost drivers include:

- Azure AI Services (pay-per-use)
- Azure Document Intelligence (pay-per-page)
- Azure Container Apps (consumption-based)
- Azure Cosmos DB (provisioned throughput)
- Azure Storage (per-GB storage and operations)

## Security

This solution implements security best practices:

- **Managed Identity**: Service-to-service authentication without stored credentials
- **RBAC**: Role-based access control for all Azure resources
- **Key Vault**: Secure storage for secrets and connection strings
- **Network Security**: Configurable network restrictions
- **TLS 1.2**: Minimum TLS version for all connections

## Customization

### Adding Custom Document Schemas

You can customize the document extraction by modifying the Document Intelligence models or creating custom extraction templates.

### Modifying the UI

The web application uses Fluent UI components. Customize the look and feel by modifying the theme in `src/web/src/index.tsx`.

### Extending the API

The API backend can be extended to support additional processing pipelines or integrations with other Azure services.

## Contributing

Contributions are welcome! Please submit a pull request or create an issue for any bugs or feature requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or support, please create an issue in this repository.
