import { Routes, Route } from "react-router-dom";
import FileUploadPage from "./Pages/FileUploadPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<FileUploadPage/>}/>
    </Routes>
  );
}

export default App;
