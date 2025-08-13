import ScrapeData from "./ScrapeData";
import { io } from "socket.io-client";
import Api from "../../../services/Api";
import Pagination from "../../Pagination";
import { useState, useEffect } from "react";
import ScheduleScrape from "./ScheduleScrape";
import JobDetailDataModal from "./JobDetailDataModal";
import { ExportOutlined, SyncOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Layout,
  message,
  Popconfirm,
  Progress,
  Table,
  Typography,
} from "antd";
import {
  CalendarDots,
  ClockClockwise,
  CaretRight,
  CaretDown,
  FileCsv,
  FileJs,
  Link,
  Scan,
  Trash,
} from "@phosphor-icons/react";
import glintsLogo from "../../../assets/Glints.png";
import jobstreetLogo from "../../../assets/Jobstreet.jpg";

const { Content } = Layout;
const { Text } = Typography;

const ExtractData = () => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [serverConnected, setServerConnected] = useState(false);
  const [jobStreetLoading, setJobStreetLoading] = useState(false);
  const [glintsLoading, setGlintsLoading] = useState(false);
  const [jobStreetProgress, setJobStreetProgress] = useState(0);
  const [jobStreetScheduleLoading, setJobStreetScheduleLoading] =
    useState(false);
  const [glintsScheduleLoading, setGlintsScheduleLoading] = useState(false);
  const [jobStreetHasScheduled, setJobStreetHasScheduled] = useState(false);
  const [glintsHasScheduled, setGlintsHasScheduled] = useState(false);
  const [glintsProgress, setGlintsProgress] = useState(0);
  const [progressLog, setProgressLog] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [jobStreetLastRun, setJobStreetLastRun] = useState("-");
  const [glintsLastRun, setGlintsLastRun] = useState("-");
  const [jobStreetNextSchedule, setJobStreetNextSchedule] = useState("-");
  const [glintsNextSchedule, setGlintsNextSchedule] = useState("-");
  const [scrapeModalOpen, setScrapeModalOpen] = useState(false);
  const [scheduleScrapeModalOpen, setScheduleScrapeModalOpen] = useState(false);
  const [scrapeSource, setScrapeSource] = useState(null);
  const [scrapeLoadingSetter, setScrapeLoadingSetter] = useState(null);
  const [jobStreetScheduleId, setJobStreetScheduleId] = useState(null);
  const [glintsScheduleId, setGlintsScheduleId] = useState(null);

  const calculateDuration = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffSecs = Math.round((endTime - startTime) / 1000);
    return `${diffSecs}s`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "running":
        return "text-blue-500";
      case "scheduled":
        return "text-orange-500";
      case "success":
        return "text-green-500";
      case "failed":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const twoColors = {
    "0%": "#108ee9",
    "100%": "#87d068",
  };

  const handleScrapeButtonClick = (source, setLoadingFunc) => {
    setScrapeSource(source);
    setScrapeLoadingSetter(() => setLoadingFunc);
    setScrapeModalOpen(true);
  };

  const handleScheduleScrapeButtonClick = (source, setLoadingFunc) => {
    setScrapeSource(source);
    setScrapeLoadingSetter(() => setLoadingFunc);
    setScheduleScrapeModalOpen(true);
  };

  const columns = [
    {
      title: "",
      key: "expand",
      width: "5%",
      render: (_, record) =>
        expandedRowKeys.includes(record.key) ? (
          <CaretDown className="text-gray-400" />
        ) : (
          <CaretRight className="text-gray-400" />
        ),
    },
    {
      title: "No",
      key: "no",
      width: "5%",
      render: (_, __, index) => (page - 1) * pageSize + index + 1,
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
    },
    {
      title: "Date added",
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span className={`${getStatusColor(status)} font-medium capitalize`}>
          {status}
        </span>
      ),
    },
    {
      title: "Percentage",
      dataIndex: "percentage",
      key: "percentage",
      render: (percentage, record) => {
        const strokeColor =
          record.status === "failed"
            ? "#ff4d4f"
            : record.status === "running"
            ? "#1890ff"
            : record.status === "scheduled"
            ? "#faad14"
            : "#52c41a";

        return (
          <Progress
            percent={percentage}
            percentPosition={{ align: "start", type: "inner" }}
            size={[undefined, 15]}
            strokeColor={strokeColor}
          />
        );
      },
    },
  ];

  const fetchScrapeSessions = async () => {
    try {
      setLoading(true);
      const response = await Api.get("/extract-data/scrape-sessions", {
        params: { page, pageSize },
      });

      const sessions = response.data || [];
      const tableData = sessions.map((session, index) => ({
        key: session.scrape_session_id,
        no: index + 1,
        sourceType: session.source,
        source:
          session.source === "jobstreet"
            ? "https://id.jobstreet.com/jobs?sortmode=ListedDate"
            : "https://glints.com/id/opportunities/jobs/explore?country=ID&locationName=All+Cities%2FProvinces&sortBy=LATEST",
        created_at: new Date(session.created_at).toLocaleDateString("id-ID"),
        scrape_id: session.scrape_session_id,
        time: calculateDuration(session.started_at, session.finished_at),
        status: session.status,
        percentage: session.percentage,
        finished_at: session.finished_at,
        scheduled_run: session.scheduled_run,
      }));

      setData(tableData);
      setTotalData(response.totalData);
      setLoading(false);
    } catch (error) {
      console.error("Could not fetch the latest activity data:", error);
      message.destroy();
      message.error(
        "Oops! We couldn’t load the latest activity. Please try again later."
      );
      setLoading(false);
    }
  };

  const handleScrape = async (source, setLoading) => {
    setLoading(true);
    message.loading({
      content: "Memeriksa status server...",
      key: "serverStatus",
    });

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const response = await Api.get("/extract-data/server-status");
      console.log("Server status response:", response);
      let isConnected = false;
      if (response && typeof response.isConnected === "boolean") {
        isConnected = response.isConnected;
      } else if (
        response &&
        response.data &&
        typeof response.data.isConnected === "boolean"
      ) {
        isConnected = response.data.isConnected;
      } else {
        console.error("Response structure:", response);
        throw new Error("Invalid response format from server");
      }
      if (!isConnected) {
        message.error({
          content:
            "Server scraping Python sedang mati atau tidak terhubung. Silakan cek kembali!",
          key: "serverStatus",
          duration: 4,
        });
        setLoading(false);
        return;
      }
      message.success({
        content: `Server aktif, proses scraping untuk ${source} akan segera dimulai.`,
        key: "serverStatus",
        duration: 3,
      });
      message.loading({
        content: `Menginisialisasi scraping ${source}...`,
        key: "scrapingInit",
        duration: 5,
      });
      await Api.post(`/extract-data/run/${source}`);
      message.success({
        content: `Scraping untuk ${source} berhasil dimulai! Silakan tunggu data...`,
        key: "scrapingInit",
      });
    } catch (error) {
      console.error("Error saat pengecekan status atau scraping:", error);
      message.error({
        content:
          "Terjadi kesalahan saat mengecek status atau menjalankan scraping.",
        key: "serverStatus",
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadJSON = async (sessionId) => {
    setLoading(true);
    try {
      const response = await Api.get(
        `/extract-data/${sessionId}/download/json`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `jobs_${sessionId}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success("JSON file downloaded successfully");
    } catch (error) {
      console.error("Failed to download JSON:", error);
      message.error("Failed to download JSON file");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async (sessionId) => {
    setLoading(true);
    try {
      const response = await Api.get(
        `/extract-data/${sessionId}/download/csv`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `jobs_${sessionId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success("CSV file downloaded successfully");
    } catch (error) {
      console.error("Failed to download CSV:", error);
      message.error("Failed to download CSV file");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (id, source) => {
    try {
      setLoading(true);
      await Api.delete(`extract-data/run-schedule/${id}`);
      message.success(`Scheduled scraping for ${source} has been cancelled`);
      if (source === "jobstreet") {
        setJobStreetHasScheduled(false);
        setJobStreetNextSchedule("-");
        setJobStreetScheduleId(null);
      } else if (source === "glints") {
        setGlintsHasScheduled(false);
        setGlintsNextSchedule("-");
        setGlintsScheduleId(null);
      }
      fetchScrapeSessions();
    } catch (error) {
      console.error(`Error deleting scheduled scraping:`, error);
      message.error(`Failed to cancel scheduled scraping for ${source}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExpandRow = (record) => {
    const newExpandedKeys = expandedRowKeys.includes(record.key)
      ? expandedRowKeys.filter((key) => key !== record.key)
      : [...expandedRowKeys, record.key];
    setExpandedRowKeys(newExpandedKeys);
  };

  const expandedRowRender = (record) => (
    <div className="p-4 bg-white rounded-lg space-y-2">
      <div className="flex flex-col">
        <Text className="font-bold text-black">
          <a href={record.source} target="_blank">
            {record.source} <ExportOutlined />
          </a>
        </Text>
        <Text type="secondary" className="text-sm">
          scrape • id: {record.scrape_id} • {record.time} •{" "}
          <span className={`${getStatusColor(record.status)}`}>
            {record.status}
          </span>
        </Text>
        <div className="flex justify-end gap-2">
          <JobDetailDataModal sessionId={record.scrape_id} />
          <Button
            className="!bg-green-500 hover:!bg-green-600 !text-white"
            onClick={() => handleDownloadCSV(record.scrape_id)}
          >
            <FileCsv />
            CSV
          </Button>
          <Button
            className="!bg-orange-500 hover:!bg-orange-600 !text-white"
            onClick={() => handleDownloadJSON(record.scrape_id)}
          >
            <FileJs />
            JSON
          </Button>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    if (data.length > 0) {
      const latestJobStreet = data
        .filter((session) => session.sourceType === "jobstreet")
        .sort((a, b) => new Date(b.finished_at) - new Date(a.finished_at))[0];
      const latestGlints = data
        .filter((session) => session.sourceType === "glints")
        .sort((a, b) => new Date(b.finished_at) - new Date(a.finished_at))[0];
      setJobStreetLastRun(
        latestJobStreet ? formatDate(latestJobStreet.finished_at) : "-"
      );
      setGlintsLastRun(
        latestGlints ? formatDate(latestGlints.finished_at) : "-"
      );
      const nextJobStreet = data
        .filter(
          (session) =>
            session.sourceType === "jobstreet" &&
            session.scheduled_run &&
            new Date(session.scheduled_run) > new Date() &&
            session.status === "scheduled"
        )
        .sort(
          (a, b) => new Date(a.scheduled_run) - new Date(b.scheduled_run)
        )[0];
      const nextGlints = data
        .filter(
          (session) =>
            session.sourceType === "glints" &&
            session.scheduled_run &&
            new Date(session.scheduled_run) > new Date() &&
            session.status === "scheduled"
        )
        .sort(
          (a, b) => new Date(a.scheduled_run) - new Date(b.scheduled_run)
        )[0];

      setJobStreetNextSchedule(
        nextJobStreet ? formatDate(nextJobStreet.scheduled_run) : "-"
      );
      setGlintsNextSchedule(
        nextGlints ? formatDate(nextGlints.scheduled_run) : "-"
      );
      setJobStreetScheduleId(nextJobStreet ? nextJobStreet.key : null);
      setGlintsScheduleId(nextGlints ? nextGlints.key : null);

      setJobStreetHasScheduled(nextJobStreet !== undefined);
      setGlintsHasScheduled(nextGlints !== undefined);
    }
  }, [data]);

  useEffect(() => {
    const socket = io("http://localhost:3000", {});
    socket.on("connect", () => {
      console.log("Connected to scraping server");
      setServerConnected(true);
      fetchScrapeSessions();
    });
    socket.on("python_server_disconnected", () => {
      setServerConnected(false);
      message.warning(
        "Python scraper server disconnected. Waiting to reconnect..."
      );

      const timeoutId = setTimeout(() => {
        // Gunakan closure biar cek status terkini
        if (!socket.connected) {
          setJobStreetLoading(false);
          setGlintsLoading(false);
          message.error("Scraping dianggap gagal karena tidak reconnect.");
        }
      }, 120000);
      socket.once("connect", () => {
        clearTimeout(timeoutId);
        setServerConnected(true);
      });
    });

    // socket.on("python_server_disconnected", () => {
    //   console.log("Python server disconnected");
    //   setServerConnected(false);
    //   setJobStreetLoading(false);
    //   setGlintsLoading(false);
    //   message.error(
    //     "Python scraper server disconnected. Please check the server status."
    //   );
    //   fetchScrapeSessions();
    // });

    socket.on("loading", (message) => {
      console.log("Progress:", message);
      setProgressLog((prev) => [...prev, message]);
      if (message.source === "jobstreet") {
        setJobStreetProgress(message.percentage);
        setJobStreetLoading(true);
      }
      if (message.source === "glints") {
        setGlintsProgress(message.percentage);
        setGlintsLoading(true);
      }
    });

    socket.on("scrape_error", (data) => {
      console.log("Scraping error:", data);
      if (data.source === "jobstreet" || !data.source) {
        setJobStreetLoading(false);
      }
      if (data.source === "glints" || !data.source) {
        setGlintsLoading(false);
      }
      message.error(`Scraping error: ${data.message}`);
      fetchScrapeSessions();
    });

    socket.on("scrape_done", (data) => {
      console.log("Scraping selesai:", data);
      if (data.source === "jobstreet" || !data.source) {
        setJobStreetLoading(false);
      }
      if (data.source === "glints" || !data.source) {
        setGlintsLoading(false);
      }
      message.success("Scraping berhasil diselesaikan!");
      fetchScrapeSessions();
    });

    const refreshInterval = setInterval(() => {
      fetchScrapeSessions();
    }, 5000);
    return () => {
      socket.disconnect();
      clearInterval(refreshInterval);
    };
  }, []);

  useEffect(() => {
    fetchScrapeSessions();
  }, [page, pageSize]);

  const handlePageChange = (page, pageSize) => {
    setPage(page);
    setPageSize(pageSize);
  };

  return (
    <Content className="p-6 mt-3">
      <main className="space-y-4">
        <div className="flex items-center justify-end">
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              serverConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <Text type={serverConnected ? "success" : "danger"}>
            Server {serverConnected ? "Connected" : "Disconnected"}
          </Text>
        </div>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="shadow-lg rounded-xl">
            <div className="flex flex-row items-center space-x-4">
              <img
                src={jobstreetLogo}
                alt="JobStreet Logo"
                className="w-18 h-14 mb-2 border rounded-lg"
              />
              <h2 className="text-xl font-semibold ">Job Street</h2>
            </div>
            <p className="flex text-xs text-gray-500 mb-1">
              <Link size={16} className="mr-1 text-blue-500" /> Source URL
            </p>
            <div className="flex items-center bg-gray-100 border rounded px-2 py-1">
              <Text className="text-xs text-gray-700 truncate flex-1">
                https://id.jobstreet.com/id/jobs?sortmode=ListedDate
              </Text>
            </div>
            <div className="flex justify-between space-x-8 mt-2 mb-1">
              <div>
                <p className="flex text-xs text-gray-500">
                  <CalendarDots size={16} className="mr-1 text-emerald-500" />{" "}
                  Next Schedule
                </p>
                <div className="flex items-center">
                  <p className="text-sm mr-2">{jobStreetNextSchedule}</p>
                  {jobStreetHasScheduled && jobStreetScheduleId && (
                    <Popconfirm
                      title="Cancel scheduled scraping?"
                      description="This action cannot be undone."
                      onConfirm={() =>
                        handleDeleteSchedule(jobStreetScheduleId, "jobstreet")
                      }
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<Trash />}
                        className="bg-red-100 rounded-full"
                      />
                    </Popconfirm>
                  )}
                </div>
              </div>
              <div>
                <p className="flex text-xs text-gray-500">
                  <ClockClockwise size={16} className="mr-1 text-orange-400" />{" "}
                  Last Run
                </p>
                <p className="text-sm">{jobStreetLastRun}</p>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-1">Progress</p>
            <Progress
              percent={jobStreetProgress}
              percentPosition={{ align: "start", type: "inner" }}
              size={[undefined, 15]}
              strokeColor={twoColors}
            />
            <div className="grid grid-cols-2 gap-2 w-full mt-4">
              <Button
                type="primary"
                style={{ height: 48 }}
                className="rounded-2xl focus:outline-none focus:shadow-outline items-center justify-center py-4 md:h-10 md:py-2 md:px-4 flex items-center"
                icon={<Scan size={18} />}
                onClick={() =>
                  handleScrapeButtonClick("jobstreet", setJobStreetLoading)
                }
                loading={jobStreetLoading && { icon: <SyncOutlined spin /> }}
              >
                Scrape
              </Button>
              <Button
                style={{ height: 48 }}
                className="rounded-2xl focus:outline-none focus:shadow-outline items-center justify-center py-4 md:h-10 md:py-2 md:px-4 flex items-center"
                icon={<CalendarDots />}
                onClick={() =>
                  handleScheduleScrapeButtonClick(
                    "jobstreet",
                    setJobStreetScheduleLoading
                  )
                }
                loading={jobStreetScheduleLoading}
                disabled={jobStreetHasScheduled || jobStreetScheduleLoading}
              >
                Schedule
              </Button>
            </div>
          </Card>

          <Card className="shadow-lg rounded-xl">
            <div className="flex flex-row items-center space-x-4">
              <img
                src={glintsLogo}
                alt="Glints Logo"
                className="w-24 h-18 mb-2 border rounded-lg"
              />
              <h2 className="text-xl font-semibold mb-2">Glints</h2>
            </div>
            <p className="flex text-xs text-gray-500 mb-1">
              <Link size={16} className="mr-1 text-blue-500" /> Source URL
            </p>
            <div className="flex items-center bg-gray-100 border rounded px-2 py-1">
              <Text className="text-xs text-gray-700">
                https://glints.com/id/opportunities/jobs/explore?country=ID&locationName=All+Cities%2FProvinces&sortBy=LATEST
              </Text>
            </div>
            <div className="flex justify-between space-x-8 mt-2 mb-1">
              <div>
                <p className="flex text-xs text-gray-500">
                  <CalendarDots size={16} className="mr-1 text-emerald-500" />{" "}
                  Next Schedule
                </p>
                <div className="flex items-center">
                  <p className="text-sm mr-2">{glintsNextSchedule}</p>
                  {glintsHasScheduled && glintsScheduleId && (
                    <Popconfirm
                      title="Cancel scheduled scraping?"
                      description="This action cannot be undone."
                      onConfirm={() =>
                        handleDeleteSchedule(glintsScheduleId, "glints")
                      }
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<Trash />}
                        className="bg-red-100 rounded-full"
                      />
                    </Popconfirm>
                  )}
                </div>
              </div>
              <div>
                <p className="flex text-xs text-gray-500">
                  <ClockClockwise size={16} className="mr-1 text-orange-400" />
                  Last Run
                </p>
                <p className="text-sm">{glintsLastRun}</p>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-1">Progress</p>
            <Progress
              percent={glintsProgress}
              percentPosition={{ align: "start", type: "inner" }}
              size={[undefined, 15]}
              strokeColor={twoColors}
            />
            <div className="grid grid-cols-2 gap-2 w-full mt-4">
              <Button
                type="primary"
                style={{ height: 48 }}
                className="rounded-2xl focus:outline-none focus:shadow-outline items-center justify-center py-4 md:h-10 md:py-2 md:px-4 flex items-center"
                icon={<Scan size={18} />}
                onClick={() =>
                  handleScrapeButtonClick("glints", setGlintsLoading)
                }
                loading={glintsLoading && { icon: <SyncOutlined spin /> }}
              >
                Scrape
              </Button>
              <Button
                style={{ height: 48 }}
                className="rounded-2xl focus:outline-none focus:shadow-outline items-center justify-center py-4 md:h-10 md:py-2 md:px-4 flex items-center"
                icon={<CalendarDots />}
                onClick={() =>
                  handleScheduleScrapeButtonClick(
                    "glints",
                    setGlintsScheduleLoading
                  )
                }
                loading={glintsScheduleLoading}
                disabled={glintsHasScheduled || glintsScheduleLoading}
              >
                Schedule
              </Button>
            </div>
          </Card>
        </section>

        <section>
          <Card className="shadow-lg rounded-xl">
            <Text className="text-2xl font-normal">Scraping Activity Log</Text>
            <Table
              className="mt-3 overflow-x-auto max-w-full custom-table-dashboard"
              columns={columns}
              dataSource={data}
              loading={loading}
              pagination={false}
              onRow={(record) => ({
                onClick: () => handleExpandRow(record),
              })}
              expandable={{
                expandedRowRender,
                expandedRowKeys,
                showExpandColumn: false,
                rowExpandable: () => true,
              }}
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
          </Card>
        </section>
      </main>
      <ScrapeData
        open={scrapeModalOpen}
        setOpen={setScrapeModalOpen}
        source={scrapeSource}
        onConfirm={() => handleScrape(scrapeSource, scrapeLoadingSetter)}
      />
      <ScheduleScrape
        open={scheduleScrapeModalOpen}
        setOpen={setScheduleScrapeModalOpen}
        source={scrapeSource}
        jobStreetHasScheduled={jobStreetHasScheduled}
        glintsHasScheduled={glintsHasScheduled}
      />
    </Content>
  );
};

export default ExtractData;
