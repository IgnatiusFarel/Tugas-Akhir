import { Button, Modal, Typography } from "antd";
import { Scan } from "@phosphor-icons/react";

const { Text } = Typography;

const ScrapeData = ({ open, setOpen, source, onConfirm }) => {
  const handleCancel = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
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
            Start Scraping {source}
          </Text>
        </div>
        <div className="flex justify-center mb-7 text-center">
          <Text className="text-gray-400 text-base">
            Are you sure you want to start scraping data from {source}? This
            process may take several minutes.
          </Text>
        </div>
      </Modal>
    </>
  );
};

export default ScrapeData;
