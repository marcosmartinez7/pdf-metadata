import "./App.css";
import { PDFDocument, PDFName, PDFString } from "pdf-lib";
import { useState } from "react";
import download from "downloadjs";
import JSZip from "jszip";

function App() {
    const [files, setFiles] = useState([]);
    const [principalInvestigators, setPrincipalInvestigators] = useState("");
    const [secondaryInvestigators, setSecondaryInvestigators] = useState("");
    const [clinicalSite, setClinicalSite] = useState("");
    const [patientCode, setPatientCode] = useState("");
    const [zipName, setZipName] = useState("");

    const handleFileInput = (event) => {
        setFiles(Array.from(event.target.files));
    };

    const setMetadata = async () => {
        return await Promise.all(
            files.map(async (file) => {
                const fileReader = new FileReader();
                fileReader.readAsArrayBuffer(file);

                return new Promise((resolve) => {
                    fileReader.onload = async () => {
                        const typedArray = new Uint8Array(fileReader.result);
                        // Open a PDF document from the Uint8Array
                        const pdfDoc = await PDFDocument.load(typedArray);

                        pdfDoc
                            .getInfoDict()
                            .set(
                                PDFName.of("Principal Investigators"),
                                PDFString.of(principalInvestigators)
                            );
                        pdfDoc
                            .getInfoDict()
                            .set(
                                PDFName.of("Secondary Investigators"),
                                PDFString.of(secondaryInvestigators)
                            );
                        pdfDoc
                            .getInfoDict()
                            .set(
                                PDFName.of("Clinical Site"),
                                PDFString.of(clinicalSite)
                            );
                        pdfDoc
                            .getInfoDict()
                            .set(
                                PDFName.of("Patient Code"),
                                PDFString.of(patientCode)
                            );

                        const pdfBytes = await pdfDoc.save();
                        resolve({ name: file.name, data: pdfBytes });
                    };
                });
            })
        );
    };

    const handleSaveAsZip = async () => {
        if (!files.length) {
            alert("Please select one or more files first");
            return;
        }
        if (!zipName) {
            alert("Please select a zip name first");
            return;
        }
        const updatedFiles = await setMetadata();
        console.log("updated files", updatedFiles);
        const zip = new JSZip();
        updatedFiles.forEach(({ name, data }) => {
            zip.file(name, data);
        });
        const content = await zip.generateAsync({ type: "blob" });
        download(content, "pdf-files.zip", "application/zip");
    };

    return (
        <form>
            <div>
                <label htmlFor="principalInvestigators">
                    Principal Investigators:
                </label>
                <textarea
                    cols="50"
                    rows={20}
                    type="text"
                    id="principalInvestigators"
                    value={principalInvestigators}
                    onChange={(e) => setPrincipalInvestigators(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="secondaryInvestigators">
                    Secondary Investigators:
                </label>
                <textarea
                    cols="50"
                    rows={20}
                    type="text"
                    id="secondaryInvestigators"
                    value={secondaryInvestigators}
                    onChange={(e) => setSecondaryInvestigators(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="clinicalSite">Clinical Site:</label>
                <input
                    type="text"
                    id="clinicalSite"
                    value={clinicalSite}
                    onChange={(e) => setClinicalSite(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="patientCode">Patient Code:</label>
                <input
                    type="text"
                    id="patientCode"
                    value={patientCode}
                    onChange={(e) => setPatientCode(e.target.value)}
                />
            </div>
            <div>
                <input type="file" onChange={handleFileInput} multiple />
            </div>
            <div>
                <label htmlFor="zipName">Zip name:</label>
                <input
                    type="text"
                    id="zipName"
                    value={zipName}
                    onChange={(e) => setZipName(e.target.value)}
                />
            </div>
            <button type="button" onClick={handleSaveAsZip}>
                Store metadata
            </button>
        </form>
    );
}

export default App;
