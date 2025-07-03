import {
  Layout,
  Card,
  Typography,
  Table,
  Tabs,  
  Dropdown,
  Menu,
} from "antd";
import { useEffect, useState } from "react";
import Api from "../../../services/Api";
import { EditOutlined, MoreOutlined } from "@ant-design/icons";
import EditData from "./EditData";

const { Content } = Layout;
const { Text } = Typography;

const ScrapeConfig = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState("jobstreet");
  const [selectedField, setSelectedField] = useState(null);
  const [openEditJobstreetConfig, setOpenEditJobstreetConfig] = useState(false);
  const [openEditGlintsConfig, setOpenEditGlintsConfig] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const handleMenuClick = (record, action) => {
    if (action === "edit") {
      setSelectedField(record);
      if (activeTab === "jobstreet") {
        setOpenEditJobstreetConfig(true);
      } else if (activeTab === "glints") {
        setOpenEditGlintsConfig(true);
      }
    }
  };

  const menu = (record) => (
    <Menu
      onClick={({ key }) => handleMenuClick(record, key)}
      className="custom-menu"
    >
      <Menu.ItemGroup title="ACTION" className="custom-menu-item-group" />
      <Menu.Item key="edit" icon={<EditOutlined className="size-5" />}>
        Edit
      </Menu.Item>
    </Menu>
  );

  const columns = [    
    { title: "Field Name", key: "field_name", dataIndex: "field_name" },
    { title: "Method", key: "method", dataIndex: "method" },
    {
      title: "Selector Value",
      key: "selector_value",
      dataIndex: "selector_value",
    },
    { title: "Attribute", key: "attribute", dataIndex: "attribute",},
    {
      title: "Last Updated",
      key: "updated_at",
      dataIndex: "updated_at",
      render: (text) => formatDate(text),
    },
    {
      title: "Action",
      key: "action",
      width: "10%",
      render: (text, record) => (
        <Dropdown overlay={menu(record)} trigger={["click"]}>
          <button className="size-5 text-red-600 ml-3">
            <MoreOutlined />
          </button>
        </Dropdown>
      ),
    },
  ];

  const fetchData = async (platform) => {
    setLoading(true);
    try {
      const response = await Api.get(`/scrape-config?platform=${platform}`);
      setData(response.data);
    } catch (error) {
      console.error("Could not fetch scrape config data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const tabItems = [
    {
      label: "Jobstreet",
      key: "jobstreet",
      children: (
        <Table
          className="mt-3 overflow-x-auto max-w-full custom-table"
          pagination={false}
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="scrape_rule_id"
        />
      ),
    },
    {
      label: "Glints",
      key: "glints",
      children: (
        <Table
          className="mt-3 overflow-x-auto max-w-full custom-table"
          pagination={false}
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="scrape_rule_id"
        />
      ),
    },
  ];

  return (
    <Content className="p-6 mt-3">
      <Card className="shadow-lg rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <Text className="font-normal text-2xl">Element Scrape Config</Text>
          
        </div>
        <Tabs
          type="card"
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      <EditData
        open={openEditJobstreetConfig}
        setOpen={setOpenEditJobstreetConfig}
        platform="jobstreet"
        data={data}
        selectedField={selectedField}
        onSave={() => {
          fetchData("jobstreet");
          setSelectedField(null);
        }}
      />
      <EditData
        open={openEditGlintsConfig}
        setOpen={setOpenEditGlintsConfig}
        platform="glints"
        data={data}
        selectedField={selectedField}
        onSave={() => {
          fetchData("glints");
          setSelectedField(null);
        }}
      />
    </Content>
  );
};

export default ScrapeConfig;
