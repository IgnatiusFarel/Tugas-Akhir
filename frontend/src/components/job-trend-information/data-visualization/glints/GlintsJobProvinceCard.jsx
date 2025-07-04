import { Column } from "@ant-design/plots";
import { Card, Empty, message, Select, Spin, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import Api from "../../../../services/Api";

const { Text } = Typography;

const GlintsJobProvinceCard = () => {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedLimit, setSelectedLimit] = useState(5);

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
    xField: "label",
    yField: "total",
    shapeField: "column25D",
    style: {
      fill: "rgba(220, 54, 46, 0.7)",
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
        limit: selectedLimit,
      };

      const response = await Api.get("/data-visualization/job-provinces", {
        params,
      });
      const jobProvinceData = response.data.dataset.map((item) => ({
        label: item.province,
        total: item.amount,
      }));
      setChartData(jobProvinceData);
    } catch (error) {
      console.error("Error fetching job province data:", error);
      message.error("Failed to load job province data");
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, selectedLimit]);

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
    return <Column {...config} />;
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <Text className="font-bold text-xl">Job Province</Text>
        <div className="space-x-2">
          <Select
            value={selectedMonth}
            onChange={setSelectedMonth}
            style={{ width: 110, height: 48 }}
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
            style={{ width: 80, height: 48 }}
          >
            {generateYearOptions()}
          </Select>
          <Select
            value={selectedLimit}
            onChange={setSelectedLimit}
            style={{ width: 85, height: 48 }}
          >
            <Select.Option value={5}>Top 5</Select.Option>
            <Select.Option value={7}>Top 7</Select.Option>
            <Select.Option value={10}>Top 10</Select.Option>
            <Select.Option value={14}>Top 14</Select.Option>
          </Select>
        </div>
      </div>
      {renderChart()}
    </Card>
  );
};

export default GlintsJobProvinceCard;
