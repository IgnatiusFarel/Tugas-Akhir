import { Input, Layout, Select, Table } from "antd";
import Api from "../../../services/Api";
import { useEffect, useState } from "react";
import Pagination from "../../Pagination";
import { SearchOutlined } from "@ant-design/icons";

const { Content } = Layout;

const DataCollection = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalData, setTotalData] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sourceFilter, setSourceFilter] = useState("");

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const columns = [
    {
      title: "No",
      key: "no",
      width: "5%",
      render: (text, record, index) => (page - 1) * pageSize + index + 1,
    },
    {
      title: "Scrape Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (text) => formatDate(text),
    },
    {
      title: "Job Posted",
      dataIndex: "job_posted",
      key: "job_posted",
      render: (text) => formatDate(text),
    },
    {
      title: "Job Title",
      dataIndex: "job_title",
      key: "job_title",
    },
    {
      title: "Job Category",
      dataIndex: "job_category",
      key: "job_category",
    },   
    {
      title: "Job Sub Category",
      dataIndex: "job_sub_category",
      key: "job_sub_category",
    },    
    {
      title: "Job Work Type",
      dataIndex: "job_work_type",
      key: "job_work_type",
    },    
    {
      title: "Job City",
      dataIndex: "job_city",
      key: "job_city",
    },
    {
      title: "Job Province",
      dataIndex: "job_province",
      key: "job_province",
    },    
    {
      title: "Job Min Salary",
      dataIndex: "job_min_salary",
      key: "job_salary",
      render: (text) =>
        text ? (
          text
        ) : (
          <span className="italic text-gray-400">Salary Undisclosed</span>
        ),
    },
    {
      title: "Job Max Salary",
      dataIndex: "job_max_salary",
      key: "job_max_salary",
      render: (text) =>
        text ? (
          text
        ) : (
          <span className="italic text-gray-400">Salary Undisclosed</span>
        ),
    },
    {
      title: "Job Source",
      dataIndex: "job_source",
      key: "job_source",
    },
    {
      title: "Job Detail URL",
      dataIndex: "job_detail_url",
      key: "job_detail_url",
      render: (text) => (
        <a
          className="text-blue-500"
          href={text}
          target="_blank"
          rel="noopener noreferrer"
        >
          {text}
        </a>
      ),
    },
  ];

  const fetchData = () => {
    setLoading(true);

    let url = `/data-collection?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&sortOrder=${sortOrder}`;

    if (sourceFilter) {
      url += `&source=${encodeURIComponent(sourceFilter)}`;
    }

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    Api.get(url)
      .then((response) => {
        setData(response.data);
        setTotalData(response.totalData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize, sourceFilter, search, sortBy, sortOrder]);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleSortChange = (value) => {
    if (value === "newest") {
      setSortBy("created_at");
      setSortOrder("desc");
    } else if (value === "oldest") {
      setSortBy("created_at");
      setSortOrder("asc");
    }
    setPage(1);
  };

  const handlePageChange = (page, pageSize) => {
    setPage(page);
    setPageSize(pageSize);
  };

  const handleSourceFilterChange = (value) => {
    setSourceFilter(value);
    setPage(1);
  };

  return (
    <Content className="p-6 mt-3">
      <div className="flex flex-row space-x-2">
        <Input
          placeholder="Search"
          prefix={<SearchOutlined className="text-red-600" />}
          className="py-2"
          style={{ width: 250, height: 48, borderRadius: "12px" }}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
        />

        <Select
          defaultValue="newest"
          className="rounded-xl"
          style={{ width: 120, height: 48 }}
          onChange={handleSortChange}
          options={[
            {
              label: <span className="font-bold ml-3">SORT</span>,
              options: [
                { label: "Newest", value: "newest" },
                { label: "Oldest", value: "oldest" },
              ],
            },
          ]}
        />
        <Select
          value={sourceFilter}
          style={{ width: 130, height: 48, borderRadius: "12px" }}
          onChange={handleSourceFilterChange}
          options={[
            {
              label: <span className="font-bold ml-3">SOURCE</span>,
              options: [
                { label: "All Sources", value: "" },
                { label: "Job Street", value: "jobstreet" },
                { label: "Glints", value: "glints" },
              ],
            },
          ]}
        />
      </div>

      <Table
        className="mt-3 overflow-x-auto max-w-full custom-table"
        scroll={{ x: 1500 }}
        rowKey={(record) => record.job_trend_information_id}
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={false}
        footer={() => (
          <Pagination
            current={page}
            pageSize={pageSize}
            total={totalData}
            onPageChange={(newPage, newPageSize) =>
              handlePageChange(newPage, newPageSize)
            }
            onPageSizeChange={(current, newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
          />
        )}
      />
    </Content>
  );
};

export default DataCollection;
