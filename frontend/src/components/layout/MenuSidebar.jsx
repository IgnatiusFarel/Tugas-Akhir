import { ScanOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

function getItem(text, label, key, link, icon, children) {
  return {
    text,
    label,
    key,
    link,
    icon,
    children,
  };
}

const MenuSidebar = [
  getItem(
    "Job Trend Information",
    "Job Trend Information",    
    "/job-trend-information",
    "/job-trend-information",
    <ScanOutlined className="size-5" />,
    [
      getItem(
        "Data Visualization",
        <Link to={`/data-visualization`}>Data Visualization</Link>,
        "data-visualization",
        "/data-visualization",
        null
      ),
      getItem(
        "Extract Data",
        <Link to={`/extract-data`}>Extract Data</Link>,
        "extract-data",
        "/extract-data",
        null
      ),
      getItem(
        "Data Collection",
        <Link to={`/data-collection`}>Data Collection</Link>,
        "data-collection",
        "/data-collection",
        null
      ),
    ]
  ),
];

export default MenuSidebar;
