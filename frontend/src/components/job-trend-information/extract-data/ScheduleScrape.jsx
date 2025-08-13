import { useState } from "react";
import { Button, Modal, Typography, DatePicker, message } from "antd";
import { Scan } from "@phosphor-icons/react";
import dayjs from "dayjs";
import Api from "../../../services/Api"

const { Text } = Typography;

const ScheduleScrape = ({ open, setOpen, source, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [scheduledTime, setScheduledTime] = useState(null);

  const handleCancel = () => {
    setOpen(false);
    setScheduledTime(null); 
  };

  const handleConfirm = async () => {
    if (!scheduledTime) {
      message.error('Please select a date and time!')
      return;
    }

    setLoading(true);
    try {
      await Api.post('extract-data/run-schedule', {
        source,
        scheduledTime: scheduledTime.toISOString()
      });
      
      message.success(`Scraping for ${source} scheduled for ${scheduledTime.format('YYYY-MM-DD HH:mm:ss')}`);
      setOpen(false);
      setScheduledTime(null);
    } catch (error) {
      console.error("Error scheduling scrape:", error);
      message.destroy();
      message.error("Failed to schedule scraping");
    } finally {
      setLoading(false);
    }
  };

  const onChange = (date) => {
    setScheduledTime(date);
  };

  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day');
  };
  
  const disabledTime = (date) => {
    if (date && date.isSame(dayjs(), 'day')) {
      const now = dayjs();
      return {
        disabledHours: () => Array.from({ length: now.hour() }, (_, i) => i),
        disabledMinutes: (selectedHour) => {
          if (selectedHour === now.hour()) {
            return Array.from({ length: now.minute() + 1 }, (_, i) => i);
          }
          return [];
        }
      };
    }
    return {};
  };

  return (
    <>
      <Modal
        centered
        open={open}
        onCancel={handleCancel}
        width={400}
        maskClosable={false}
        footer={
          <div className="flex justify-center">
            <Button
              className="font-semibold mr-3"
              onClick={handleCancel}
              style={{ height: 48, borderRadius: "12px" }}
            >
              No, cancel
            </Button>
            <Button
              type="primary"
              className="font-semibold mr-3"
              onClick={handleConfirm}
              style={{ height: 48, borderRadius: "12px" }}
              disabled={!scheduledTime}
              loading={loading}
            >
              Yes, proceed
            </Button>
          </div>
        }
        style={{
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        <div className="flex justify-center mb-3">
          <Scan size={40} />
        </div>
        <div className="flex justify-center mb-3">
          <Text className="text-xl font-semibold text-center">
            Schedule Scraping for {source}
          </Text>
        </div>
        <div className="flex justify-center mb-7 text-center">
          <Text className="text-gray-400 text-base">
          Please select when you would like to schedule scraping for <strong>{source}</strong>
          </Text>
        </div>

        <div className="mb-5">
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            onChange={onChange}
            value={scheduledTime}
            placeholder="Select date and time"
            style={{ width: '100%' }}
            disabledDate={disabledDate}
            disabledTime={disabledTime}
          />
        </div>
      </Modal>
    </>
  );
};

export default ScheduleScrape;
