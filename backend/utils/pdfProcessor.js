import { PDFDocument } from "pdf-lib";
import fs from "fs";

export const modifyResume = async (text, suggestions) => {
    const modifiedText = text.replace(/Experience:/i, `Experience:\n- ${suggestions.join("\n- ")}`);

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    page.drawText(modifiedText, { x: 50, y: 750, size: 12 });

    const pdfBytes = await pdfDoc.save();
    const filePath = "modified_resume.pdf";
    fs.writeFileSync(filePath, pdfBytes);

    return filePath;
};
