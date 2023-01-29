import "./App.css";
import { PDFDocument, PDFName } from "pdf-lib";
import { useState } from "react";

function App() {
    const [file, setFile] = useState(null);

    const handleFileInput = (event) => {
        const file = event.target.files[0];
        setFile(file);
    };

    const handleExtract = async () => {
        if (!file) {
            console.log("Please select a file first");
            return;
        }
        const fileReader = new FileReader();
        fileReader.onload = async () => {
            const typedArray = new Uint8Array(fileReader.result);

            // Open a PDF document from the Uint8Array
            const pdfDoc = await PDFDocument.load(typedArray);

            console.dir(pdfDoc);
            console.log(pdfDoc.getTitle());
            console.log(pdfDoc.getInfoDict());

            console.log(pdfDoc.getKeywords());
            console.log(
                "Custom property",
                pdfDoc.getInfoDict().get(PDFName.of("Custom"))
            );

            console.log("Changing keywords");

            const oldKeywords = pdfDoc.getKeywords();
            pdfDoc.setKeywords(["Jhon", "Patricia"].concat(oldKeywords));

            console.log(pdfDoc.getKeywords());

            console.log("Adding new property");
            pdfDoc.getInfoDict().set(PDFName.of("Clinical site"), "Hospital");
            console.log(
                "Clinical site",
                pdfDoc.getInfoDict().get(PDFName.of("Clinical site"))
            );
        };
        fileReader.readAsArrayBuffer(file);
    };

    return (
        <div>
            <input
                type="file"
                onChange={handleFileInput}
                accept="application/pdf"
            />
            <button onClick={handleExtract}>Extract Metadata</button>
        </div>
    );
}

export default App;
