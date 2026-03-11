import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  EditOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import '@umijs/max';
import { Button, Form, Input, Modal, Select } from 'antd';
import React, { useEffect } from 'react';
import styles from './modalTheme.less';

export type Props = {
  values: API.InterfaceInfo;
  columns: ProColumns<API.InterfaceInfo>[];
  onCancel: () => void;
  onSubmit: (values: API.InterfaceInfo) => Promise<void>;
  visible: boolean;
};

const methodOptions = [
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
];

const statusOptions = [
  { label: '开启', value: 1 },
  { label: '关闭', value: 0 },
];

const UpdateModal: React.FC<Props> = (props) => {
  const { values, visible, onCancel, onSubmit } = props;
  const [form] = Form.useForm<API.InterfaceInfo>();

  useEffect(() => {
    if (!visible) {
      return;
    }
    form.resetFields();
    form.setFieldsValue({
      ...values,
      method: (values?.method || 'GET').toUpperCase(),
      status: typeof values?.status === 'number' ? values.status : 0,
    });
  }, [visible, values, form]);

  const handleFinish = async (formValues: API.InterfaceInfo) => {
    await onSubmit?.({
      ...values,
      ...formValues,
    });
  };

  return (
    <Modal
      visible={visible}
      footer={null}
      width={980}
      className={styles.modalShell}
      title={
        <div className={styles.modalTitle}>
          <EditOutlined />
          <span>编辑接口信息</span>
        </div>
      }
      onCancel={() => onCancel?.()}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className={styles.editorForm} onFinish={handleFinish}>
        <div className={styles.formSections}>
          <section className={styles.sectionCard}>
            <div className={styles.sectionHead}>
              <InfoCircleOutlined />
              <span>基础信息</span>
            </div>
            <div className={styles.formGrid}>
              <Form.Item
                label="接口名称"
                name="name"
                rules={[
                  { required: true, message: '请输入接口名称' },
                  { max: 64, message: '接口名称最多 64 个字符' },
                ]}
              >
                <Input placeholder="例如：查询天气" />
              </Form.Item>

              <Form.Item
                label="请求方法"
                name="method"
                rules={[{ required: true, message: '请选择请求方法' }]}
              >
                <Select options={methodOptions} placeholder="请选择请求方法" />
              </Form.Item>

              <Form.Item
                className={styles.fullRow}
                label="请求地址 URL"
                name="url"
                rules={[
                  { required: true, message: '请输入请求地址' },
                  { max: 512, message: 'URL 最多 512 个字符' },
                ]}
              >
                <Input placeholder="https://api.example.com/v1/resource" />
              </Form.Item>

              <Form.Item className={styles.fullRow} label="接口描述" name="description">
                <Input.TextArea
                  placeholder="请输入接口描述"
                  autoSize={{ minRows: 2, maxRows: 4 }}
                />
              </Form.Item>

              <Form.Item
                className={styles.fullRow}
                label="状态"
                name="status"
                rules={[{ required: true }]}
              >
                <Select options={statusOptions} placeholder="请选择状态" className={styles.statusSelect} />
              </Form.Item>
            </div>
          </section>

          <section className={styles.sectionCard}>
            <div className={styles.sectionHead}>
              <ArrowUpOutlined />
              <span>请求配置</span>
            </div>
            <div className={styles.formGrid}>
              <Form.Item className={styles.fullRow} label="请求参数（JSON）" name="requestParams">
                <Input.TextArea
                  className={styles.codeTextArea}
                  placeholder='例如：{"name":"张三"}'
                  autoSize={{ minRows: 3, maxRows: 5 }}
                />
              </Form.Item>

              <Form.Item className={styles.fullRow} label="请求头（JSON）" name="requestHeader">
                <Input.TextArea
                  className={styles.codeTextArea}
                  placeholder='例如：{"Content-Type":"application/json"}'
                  autoSize={{ minRows: 2, maxRows: 4 }}
                />
              </Form.Item>
            </div>
          </section>

          <section className={styles.sectionCard}>
            <div className={styles.sectionHead}>
              <ArrowDownOutlined />
              <span>响应配置</span>
            </div>
            <div className={styles.formGrid}>
              <Form.Item className={styles.fullRow} label="响应头（JSON）" name="responseHeader">
                <Input.TextArea
                  className={styles.codeTextArea}
                  placeholder='例如：{"Content-Type":"application/json"}'
                  autoSize={{ minRows: 2, maxRows: 4 }}
                />
              </Form.Item>
            </div>
          </section>
        </div>

        <div className={styles.footerActions}>
          <Button className={styles.cancelButton} onClick={() => onCancel?.()}>
            取消
          </Button>
          <Button type="primary" htmlType="submit" className={styles.submitButton}>
            保存修改
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default UpdateModal;
