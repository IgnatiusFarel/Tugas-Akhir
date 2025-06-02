import { Column, Pie } from '@ant-design/plots';
import { Card, Typography } from 'antd';
import { useEffect, useState } from 'react';
import Api from '../../../../services/Api';

const { Text } = Typography;

const GlintsJobSalaryCard = () => {
  const [loading, setloading] = useState()
  const [chartData, setchartData] = useState([])

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
    setloading(true)
    try {
      const response = await Api.get('/data-visualization/job-salaries?source=glints')
      const jobWorkTypeData = response.data.dataset.map(item => ({
        label: item.salary,
        value: item.amount
      }));
      setchartData(jobWorkTypeData)
    } catch (error) {
      console.log(error)
    } finally {
      setloading(false)
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Card>
      <Text className="font-bold text-xl block mb-4">
        Glints Job Salary
      </Text>
      <Column {...config} />
    </Card>
  );
};

export default GlintsJobSalaryCard;