import JobstreetJobCategoryCard from "./jobstreet/JobstreetJobCategoryCard.jsx";
import GlintsJobCategoryCard from "./glints/GlintsJobCategoryCard.jsx";
import JobstreetJobWorkTypeCard from "./jobstreet/JobstreetJobWorkTypeCard.jsx";
import GlintsJobWorkTypeCard from "./glints/GlintsJobWorkTypeCard.jsx";
import JobstreetJobSubCategoryCard from "./jobstreet/JobstreetJobSubCategoryCard.jsx";
import GlintsJobSubCategoryCard from "./glints/GlintsJobSubCategoryCard.jsx";
import JobstreetJobCityCard from "./jobstreet/JobstreetJobCityCard.jsx";
import JobstreetJobProvinceCard from "./jobstreet/JobstreetJobProvinceCard.jsx";
import GlintsJobCityCard from "./glints/GlintsJobCityCard.jsx";
import GlintsJobProvinceCard from "./glints/GlintsJobProvinceCard.jsx";
import JobstreetJobSalaryCard from "./jobstreet/JobstreetJobSalaryCard.jsx";
import GlintsJobSalaryCard from "./glints/GlintsJobSalaryCard.jsx";
import jobstreetsLogo from "../../../assets/Jobstreets.png";
import glintsLogo from "../../../assets/Glints.png";

const DataVisualization = () => {
  return (
    <main className="p-6 mt-3">
      <div className="grid grid-cols-1 space-y-4">
        <div className="border rounded-lg p-4 bg-blue-50 ">
          <img src={jobstreetsLogo} className="h-12" />
        </div>
        <JobstreetJobCategoryCard />
        <JobstreetJobSubCategoryCard />
        <JobstreetJobCityCard />
        <JobstreetJobProvinceCard />
        <JobstreetJobSalaryCard />
        <JobstreetJobWorkTypeCard />
      
        <div className="border rounded-lg p-4 bg-orange-50 ">
          <img src={glintsLogo} className="h-16" />
        </div>
        <GlintsJobCategoryCard />
        <GlintsJobSubCategoryCard />
        <GlintsJobCityCard />
        <GlintsJobProvinceCard />
        <GlintsJobSalaryCard />
        <GlintsJobWorkTypeCard />
      </div>
    </main>
  );
};

export default DataVisualization;
