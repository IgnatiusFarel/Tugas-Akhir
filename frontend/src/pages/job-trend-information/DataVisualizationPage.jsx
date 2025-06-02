import DashboardLayout from "../../components/layout/DashboardLayout";
import DataVisualization from "../../components/job-trend-information/data-visualization/DataVisualization"
import { Helmet, HelmetProvider } from "react-helmet-async";

const DataVisualizationPage = () => {
  return (
    <HelmetProvider>
      <Helmet>
        <title>Digitefa - Data Visualization</title>
        <meta name="description" content="Digitefa" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.svg" />
      </Helmet>
    <DashboardLayout>
        <DataVisualization />
    </DashboardLayout>
    </HelmetProvider>
  )
}

export default DataVisualizationPage;