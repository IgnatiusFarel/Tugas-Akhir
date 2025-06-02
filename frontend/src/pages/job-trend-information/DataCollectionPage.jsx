import DashboardLayout from "../../components/layout/DashboardLayout";
import DataCollection from "../../components/job-trend-information/data-collection/DataCollection";
import { Helmet, HelmetProvider } from "react-helmet-async";

const DataCollectionPage = () => {
  return (
    <HelmetProvider>
      <Helmet>
        <title>Digitefa - Data Collection</title>
        <meta name="description" content="Digitefa" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.svg" />
      </Helmet>
      <DashboardLayout>
        <DataCollection />
      </DashboardLayout>
    </HelmetProvider>
  );
};

export default DataCollectionPage;
