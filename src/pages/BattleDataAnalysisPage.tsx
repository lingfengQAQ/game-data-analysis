import { useState } from 'react';
import { Button, Space, Modal, message, Radio, Dropdown } from 'antd';
import { UploadOutlined, ExportOutlined, DownOutlined, FileExcelOutlined } from '@ant-design/icons';
import { FileUpload } from '../components/FileUpload';
import { BattleDataTable } from '../components/BattleDataAnalysis/DataTable';
import { useBattleDataStore } from '../stores/battleDataStore';
import { exportBattleDataToCSV, exportBattleDataToExcel } from '../services/exportService';
import { ViewMode } from '../types';

export function BattleDataAnalysisPage() {
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const guildData = useBattleDataStore(state => state.guildData);
  const viewMode = useBattleDataStore(state => state.viewMode);
  const setViewMode = useBattleDataStore(state => state.setViewMode);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const handleExportCSV = () => {
    exportBattleDataToCSV(guildData);
    message.success('CSV 数据已导出');
  };

  const handleExportExcel = async () => {
    try {
      await exportBattleDataToExcel(guildData);
      message.success('Excel 数据已导出');
    } catch (error) {
      message.error('导出 Excel 失败');
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '16px' }}>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button
            icon={<UploadOutlined />}
            onClick={() => setUploadModalVisible(true)}
          >
            导入帮战数据
          </Button>

          {guildData.length > 0 && (
            <>
              <Radio.Group value={viewMode} onChange={(e) => handleViewModeChange(e.target.value)}>
                <Radio.Button value="guild">按帮会分组</Radio.Button>
                <Radio.Button value="guild-team">按帮会和团队分组</Radio.Button>
              </Radio.Group>

              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'csv',
                      label: '导出为 CSV',
                      icon: <ExportOutlined />,
                      onClick: handleExportCSV
                    },
                    {
                      key: 'excel',
                      label: '导出为 Excel（带格式）',
                      icon: <FileExcelOutlined />,
                      onClick: handleExportExcel
                    }
                  ]
                }}
              >
                <Button icon={<ExportOutlined />}>
                  导出数据 <DownOutlined />
                </Button>
              </Dropdown>
            </>
          )}
        </Space>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', border: '1px solid #d9d9d9', borderRadius: '8px', backgroundColor: '#fff' }}>
        {guildData.length > 0 ? (
          <BattleDataTable />
        ) : (
          <div style={{ padding: 32, textAlign: 'center', color: '#999' }}>
            <p>暂无帮战数据</p>
            <Button type="primary" onClick={() => setUploadModalVisible(true)}>
              导入帮战数据
            </Button>
          </div>
        )}
      </div>

      {/* 上传模态框 */}
      <Modal
        title="导入帮战数据"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
        width={600}
      >
        <FileUpload type="battle" />
      </Modal>
    </div>
  );
}
