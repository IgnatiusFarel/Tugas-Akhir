import { Column } from "@ant-design/plots";
import { Card, message, Select, Typography } from "antd";
import { useEffect, useState } from "react";
import Api from "../../../../services/Api";

const { Text } = Typography;

const GlintsJobSubCategoryCard = () => {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const config = {
    data: chartData,
    xField: "label",
    yField: "value",
    shapeField: "column25D",
    style: {
      fill: "rgba(126, 212, 236, 0.8)",
    },
    height: 300,
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await Api.get(`/data-visualization/job-sub-categories?source=glints`)
      const jobCategoryData = response.data.dataset.map(item => ({
        label: item.subCategory,
        value: item.amount 
      }));
      setChartData(jobCategoryData)
    } catch (error) {
      console.error('Error fetching job category data:', error);
      message.error('Failed to load job category data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <Text className="font-bold text-xl">Glints Job Sub Category</Text>
        <div className="space-x-2">
          <Select
            value={selectedMonth}
            onChange={setSelectedMonth}
            style={{width: 130, height:48}}
          >
           <Select.Option value={1}>January</Select.Option>
            <Select.Option value={2}>February</Select.Option>
            <Select.Option value={3}>March</Select.Option>
            <Select.Option value={4}>April</Select.Option>
            <Select.Option value={5}>May</Select.Option>
            <Select.Option value={6}>June</Select.Option>
            <Select.Option value={7}>July</Select.Option>
            <Select.Option value={8}>August</Select.Option>
            <Select.Option value={9}>September</Select.Option>
            <Select.Option value={10}>October</Select.Option>
            <Select.Option value={11}>November</Select.Option>
            <Select.Option value={12}>December</Select.Option>
          </Select>
          <Select
            style={{
              width: 120,
              height: 48,
            }}
          />
        </div>
      </div>
      <Column {...config} />
    </Card>
  );
};

export default GlintsJobSubCategoryCard;
