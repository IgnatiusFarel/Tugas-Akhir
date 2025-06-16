import { Pie } from "@ant-design/plots";
import { Card, Empty, message, Select, Spin, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import Api from "../../../../services/Api";

const { Text } = Typography;

const GlintsJobWorkTypeCard = () => {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const generateYearOptions = () => {
    const years = [];
    for (let i = 0; i < 5; i++) {
      const year = currentYear + i;
      years.push(
        <Select.Option key={year} value={year}>
          {year}
        </Select.Option>
      );
    }
    return years;
  };

  const monthOptions = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const config = {
    data: chartData,
    angleField: "total",
    colorField: "label",
    legend: false,
    innerRadius: 0.6,    
    style: {
      stroke: "#fff",
      inset: 1,
      radius: 10,
    },
    scale: {
      color: {
          range: ["#dc362e", "#e04e49", "#e36664", "#e87e7f", "#eca7a6"],
      },
    },
     label: {
      text: "label",
      position: "outside",     
      transform: [
        {
          type: "overlapDodgeY",
        },
      ],
    },
    height: 300,
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        source: "glints",
        month: selectedMonth,
        year: selectedYear,
      };
      const response = await Api.get("/data-visualization/job-work-types", {
        params,
      });
      const jobWorkTypeData = response.data.dataset.map((item) => ({
        label: item.workType,
        total: item.amount,
      }));
      setChartData(jobWorkTypeData);
    } catch (error) {
      console.error("Error fetching job work type data:", error);
      message.error("Failed to load job work type data");
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);
  
    useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-72">
          <Spin size="large" />
        </div>
      );
    }

    if (!chartData || chartData.length === 0) {
      return <Empty description="No data available" />;
    }
    return <Pie {...config} />;
  };



  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <Text className="font-bold text-xl block mb-4">
          Job Work Type
        </Text>
        <div className="space-x-2">
          <Select
            value={selectedMonth}
            onChange={setSelectedMonth}
            style={{ width: 130, height: 48 }}
          >
            {monthOptions.map((month) => (
              <Select.Option key={month.value} value={month.value}>
                {month.label}
              </Select.Option>
            ))}
          </Select>
          <Select
            value={selectedYear}
            onChange={setSelectedYear}
            style={{ width: 100, height: 48 }}
          >
            {generateYearOptions()}
          </Select>
        </div>
      </div>
      {renderChart()}
    </Card>
  );
};

export default GlintsJobWorkTypeCard;
