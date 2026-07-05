import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
const loader = new PDFLoader("C:/Users/ASUS/Downloads/ProjectDocs");
const docs = await loader.load();
console.log(docs);
//# sourceMappingURL=ragagents.js.map