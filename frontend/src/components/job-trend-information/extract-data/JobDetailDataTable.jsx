import { message, Table } from "antd";
import Pagination from "../../Pagination";
import { useEffect, useState } from "react";
import Api from "../../../services/Api";

const JobDetailDataTable = ({ sessionId }) => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

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
      render: (text, record, index) => (page - 1) * pageSize + index + 1,
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
      key: "job_min_salary",
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
      width: "10%",
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
    if (!sessionId) {
      console.error("No session ID provided to JobDetailDataTable");
      return;
    }
    setLoading(true);
    Api.get(`/extract-data/${sessionId}`, {
      params: { page, pageSize },
    })
      .then((response) => {
        setData(response.data);
        setTotalData(response.totalData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching job details:", error);
        setLoading(false);
        message.destroy();
        message.error("Oops! Something went wrong while loading job detail data table. Please try again later.");
      });
  };

  useEffect(() => {
    if (sessionId) {
      fetchData();
    }
  }, [sessionId, page, pageSize]);

  const handlePageChange = (page, pageSize) => {
    setPage(page);
    setPageSize(pageSize);
  };

  return (
    <div>
      <Table
        className="mt-3 overflow-x-auto max-w-full custom-table-dashboard"
        rowKey={(record) => record}
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
    </div>
  );
};

export default JobDetailDataTable;
