import { Pie } from '@ant-design/plots';
import { Card, Typography } from 'antd';
import { useEffect, useState } from 'react';
import Api from '../../../../services/Api';

const { Text } = Typography;

const GlintsJobWorkTypeCard = () => {
  const [loading, setloading] = useState()
  const [chartData, setchartData] = useState([])

  const config = {
    data: chartData,
    angleField: 'value',
    colorField: 'label',
    legend: false,
    innerRadius: 0.6,
    labels: [
      { text: 'label', style: { fontSize: 10, fontWeight: 'bold' } },
      {
        text: (d, i, data) => (i < data.length - 3 ? d.value : ''),
        style: { fontSize: 9, dy: 12 },
      },
    ],
    style: {
      stroke: '#fff',
      inset: 1,
      radius: 10,
    },
    scale: {
      color: {
        palette: 'spectral',
        offset: (t) => t * 0.8 + 0.1,
      },
    },
    height: 300,
  };

  const fetchData = async () => { 
    setloading(true)
    try {
      const response = await Api.get('/data-visualization/job-work-types?source=glints')
      const jobWorkTypeData = response.data.dataset.map(item => ({
        label: item.workType,
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
       Glints Job Work Type
      </Text>
      <Pie {...config} />
    </Card>
  );
};

export default GlintsJobWorkTypeCard;