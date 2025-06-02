import { useState } from 'react';
import { Modal, Button } from 'antd';
import JobDetailDataTable from './JobDetailDataTable';
import { Eye } from '@phosphor-icons/react';

const JobDetailDataModal = ({ sessionId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const showModal = () => {
    setIsOpen(true);
    setLoading(true);
    setTimeout(() => setLoading(false), 500); 
  };

  return (
    <>
      <Button onClick={showModal} className='!bg-blue-500 hover:!bg-blue-600 !text-white'>
        <Eye /> View Detail
      </Button>
      <Modal
       loading={loading}
        title={`Job Details - Session ${sessionId}`}
        style={{ top: 20 }}
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        width={1200}
        footer={null}
        destroyOnClose={true}
      >
        {isOpen && <JobDetailDataTable sessionId={sessionId} />}
      </Modal>
    </>
  );
};

export default JobDetailDataModal;
