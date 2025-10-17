# Askly AI - NotebookLM Clone

A powerful AI-powered document chat application that allows you to upload PDFs (text-based or scanned handwritten notes) and have intelligent conversations with them using OpenAI GPT-4 and LangChain.

## Features

- Smart PDF Processing: Automatically detects and processes both text-based and scanned PDFs
- OCR Support: Extracts text from handwritten or scanned notes using Tesseract.js
- Intelligent Chat: Ask questions in natural language and get accurate answers
- Lightning Fast: Powered by Qdrant vector database for blazing fast semantic search
- Premium UI: Modern, professional, and user-friendly interface
- Scalable Architecture: Clean folder structure with separation of concerns

## Tech Stack

- Frontend: Next.js 15, React 19, Tailwind CSS
- AI/ML: OpenAI GPT-4o-mini, LangChain.js, OpenAI Embeddings
- Vector Database: Qdrant
- PDF Processing: pdf-parse, pdf.js, Tesseract.js

## Getting Started

### Prerequisites

1. Node.js (v18 or higher)
2. OpenAI API Key - Get from https://platform.openai.com/
3. Qdrant - Vector database (can run locally with Docker)

### Installation

1. Clone and install:

```bash
npm install
```

2. Set up Qdrant using Docker Compose:

```bash
docker-compose up -d
```

3. Configure environment:

```bash
cp .env.example .env
```

Edit .env and add your OPENAI_API_KEY

4. Run development server:

```bash
npm run dev
```

5. Open http://localhost:3000

## Usage

1. Upload a PDF (text-based or scanned)
2. Wait for AI processing
3. Start chatting with your document!

Built with Next.js, LangChain, OpenAI, and Qdrant
