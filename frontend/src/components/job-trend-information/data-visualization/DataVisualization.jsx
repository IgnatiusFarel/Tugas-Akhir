import JobstreetJobCategoryCard from "./jobstreet/JobstreetJobCategoryCard.jsx";
import GlintsJobCategoryCard from "./glints/GlintsJobCategoryCard.jsx";
import JobstreetJobWorkTypeCard from "./jobstreet/JobstreetJobWorkTypeCard.jsx";
import GlintsJobWorkTypeCard from "./glints/GlintsJobWorkTypeCard.jsx";
import JobstreetJobSubCategoryCard from "./jobstreet/JobstreetJobSubCategoryCard.jsx";
import GlintsJobSubCategoryCard from "./glints/GlintsJobSubCategoryCard.jsx";
import JobstreetJobLocationCard from "./jobstreet/JobstreetJobLocationCard.jsx";
import GlintsJobLocationCard from "./glints/GlintJobLocationCard.jsx";
import JobstreetJobSalaryCard from "./jobstreet/JobstreetJobSalaryCard.jsx";
import GlintsJobSalaryCard from "./glints/GlintsJobSalaryCard.jsx";

const DataVisualization = () => {
  return (
    <main className="p-6 mt-3">
      <div className="grid grid-cols-1 space-y-4">
        <JobstreetJobCategoryCard />
        <GlintsJobCategoryCard />
        <JobstreetJobSubCategoryCard />
        <GlintsJobSubCategoryCard />
        <JobstreetJobWorkTypeCard />
        <GlintsJobWorkTypeCard />
        <JobstreetJobLocationCard />  
        <GlintsJobLocationCard />   
        <JobstreetJobSalaryCard />
        <GlintsJobSalaryCard />   
      </div>
    </main>
  );
};

export default DataVisualization;