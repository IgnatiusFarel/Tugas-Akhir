import { Button, Form, Input, message, Modal,} from "antd";
import Api from "../../../services/Api";
import { useEffect } from "react";

const EditData = ({  open, setOpen, platform, onSave, selectedField  }) => {
  const [form] = Form.useForm();

  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
  };


  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // PATCH to /scrape-config/{id}
      await Api.patch(`/scrape-config/${selectedField.scrape_rule_id}`, {
        ...values,
        platform,
      });

      message.success("Config updated!");
      onSave?.();
      handleCancel();
    } catch (error) {
      console.error(error);
      message.error("Failed to update config");
    }
  };

  useEffect(() => {
    if (selectedField) {
      form.setFieldsValue({
        field_name: selectedField.field_name,
        method: selectedField.method,
        selector_value: selectedField.selector_value,
        attribute: selectedField.attribute,
      });
    } else {
      form.resetFields();
    }
  }, [selectedField, form]);
;


  return (
    <>
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              //   src={EditDataIcon}
              alt="Edit Data"
              className="menu-icon"
              style={{
                marginRight: 10,
                marginBottom: 10,
                height: 40,
                width: 40,
              }}
            />
            <span>Edit Data</span>
          </div>
        }
        centered
        visible={open}
        onCancel={handleCancel}
        width={400}
        maskClosable={false}
        destroyOnClose={true}
        footer={null}
        style={{
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 16 }}
        >
          <hr
            style={{
              flex: 1,
              borderColor: "#E9E9E9",
              margin: 3,
              borderWidth: "1px",
            }}
          />
        </div>
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item name="field_name" label="Field Name">
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="method"
          label="Method"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="selector_value"
          label="Selector Value"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="attribute"
          label="Attribute"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

          <div className="mt-7" style={{ textAlign: "center" }}>
            <Button
              onClick={handleCancel}
              style={{
                width: 120,
                height: 40,
                borderColor: "#BBB",
                borderRadius: 12,
                marginRight: 8,
              }}
            >
              <span className="font-medium">Cancel</span>
            </Button>
            <Button
              type="primary"
              onClick={handleSave}
              style={{
                width: 120,
                height: 40,
                borderColor: "#BBB",
                borderRadius: 12,
              }}
            >
              <span className="font-medium"> Save</span>
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default EditData;
