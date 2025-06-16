import JobstreetJobCategoryCard from "./jobstreet/JobstreetJobCategoryCard.jsx";
import GlintsJobCategoryCard from "./glints/GlintsJobCategoryCard.jsx";
import JobstreetJobWorkTypeCard from "./jobstreet/JobstreetJobWorkTypeCard.jsx";
import GlintsJobWorkTypeCard from "./glints/GlintsJobWorkTypeCard.jsx";
import JobstreetJobSubCategoryCard from "./jobstreet/JobstreetJobSubCategoryCard.jsx";
import GlintsJobSubCategoryCard from "./glints/GlintsJobSubCategoryCard.jsx";
import JobstreetJobLocationCard from "./jobstreet/JobstreetJobLocationCard.jsx";
import GlintsJobLocationCard from "./glints/GlintsJobLocationCard.jsx";
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
        <JobstreetJobLocationCard />
        <JobstreetJobSalaryCard />
        <JobstreetJobWorkTypeCard />
      
        <div className="border rounded-lg p-4 bg-orange-50 ">
          <img src={glintsLogo} className="h-16" />
        </div>
        <GlintsJobCategoryCard />
        <GlintsJobSubCategoryCard />
        <GlintsJobLocationCard />
        <GlintsJobSalaryCard />
        <GlintsJobWorkTypeCard />
      </div>
    </main>
  );
};

export default DataVisualization;
