import DashboardLayout from "../../components/layout/DashboardLayout";
import ScrapeConfig from "../../components/job-trend-information/scrape-config/ScrapeConfig";
import { Helmet, HelmetProvider } from "react-helmet-async";

const ScrapeConfigPage = () => {
  return (
    <HelmetProvider>
      <Helmet>
        <title>Digitefa - Scrape Config</title>
        <meta name="description" content="Digitefa" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.svg" />
      </Helmet>
      <DashboardLayout>
        <ScrapeConfig />
      </DashboardLayout>
    </HelmetProvider>
  );
};

export default ScrapeConfigPage;
