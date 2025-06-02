import { Routes, Route } from "react-router-dom";
import ExtractDataPage from "../pages/job-trend-information/ExtractDataPage";
import DataCollectionPage from "../pages/job-trend-information/DataCollectionPage";
import DataVisualizationPage from "../pages/job-trend-information/DataVisualizationPage";

function Index() {
  return (
    <Routes>
      <Route path="/data-visualization" element={<DataVisualizationPage />} />
      <Route path="/extract-data" element={<ExtractDataPage />} />
      <Route path="/data-collection" element={<DataCollectionPage />} />
    </Routes>
  );
}

export default Index;
