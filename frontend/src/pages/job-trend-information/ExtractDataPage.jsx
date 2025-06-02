import { Helmet, HelmetProvider } from "react-helmet-async";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ExtractData from "../../components/job-trend-information/extract-data/ExtractData";

const ExtractDataPage = () => {
  return (
    <HelmetProvider>
      <Helmet>
        <title>Digitefa - Extract Data</title>
        <meta name="description" content="Digitefa" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.svg" />
      </Helmet>
      <DashboardLayout>
        <ExtractData />
      </DashboardLayout>
    </HelmetProvider>
  );
};

export default ExtractDataPage;
