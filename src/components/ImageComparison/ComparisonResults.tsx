import { Card, Button, Space, Tag, message } from 'antd';
import { DownloadOutlined, CopyOutlined } from '@ant-design/icons';
import { ComparisonResult } from '../../types/comparison';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

interface ComparisonResultsProps {
  result: ComparisonResult;
}

export function ComparisonResults({ result }: ComparisonResultsProps) {
  
  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    
    // 工作表1: 共同
    const sheet1 = workbook.addWorksheet('共同');
    sheet1.columns = [{ header: '角色名', key: 'name', width: 20 }];
    result.common.forEach(name => sheet1.addRow({ name }));
    
    // 工作表2: 仅组1
    const sheet2 = workbook.addWorksheet('仅组1');
    sheet2.columns = [{ header: '角色名', key: 'name', width: 20 }];
    result.onlyInGroup1.forEach(name => sheet2.addRow({ name }));
    
    // 工作表3: 仅组2
    const sheet3 = workbook.addWorksheet('仅组2');
    sheet3.columns = [{ header: '角色名', key: 'name', width: 20 }];
    result.onlyInGroup2.forEach(name => sheet3.addRow({ name }));
    
    // 下载
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer]);
    saveAs(blob, `名单对比_${Date.now()}.xlsx`);
    message.success('导出成功');
  };
  
  const handleExportCSV = () => {
    const rows = [
      ['类别', '角色名'],
      ...result.common.map(name => ['共同', name]),
      ...result.onlyInGroup1.map(name => ['仅组1', name]),
      ...result.onlyInGroup2.map(name => ['仅组2', name]),
    ];
    
    const csv = Papa.unparse(rows);
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `名单对比_${Date.now()}.csv`);
    message.success('导出成功');
  };
  
  const handleCopy = () => {
    const text = `
共同 (${result.common.length}人):
${result.common.join('\n')}

仅在组1 (${result.onlyInGroup1.length}人):
${result.onlyInGroup1.join('\n')}

仅在组2 (${result.onlyInGroup2.length}人):
${result.onlyInGroup2.join('\n')}
    `.trim();
    
    navigator.clipboard.writeText(text);
    message.success('已复制到剪贴板');
  };

  return (
    <Card 
      title="对比结果" 
      className="comparison-results"
      extra={
        <Space>
          <Button icon={<CopyOutlined />} onClick={handleCopy}>
            复制
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExportCSV}>
            导出CSV
          </Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExportExcel}>
            导出Excel
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div className="result-section">
          <div className="result-header">
            <Tag color="green">共同</Tag>
            <span className="result-count">{result.common.length} 人</span>
          </div>
          <div className="result-list">
            {result.common.length > 0 ? (
              result.common.map((name, index) => (
                <Tag key={index} color="green">{name}</Tag>
              ))
            ) : (
              <span className="empty-text">无</span>
            )}
          </div>
        </div>
        
        <div className="result-section">
          <div className="result-header">
            <Tag color="blue">仅在组1</Tag>
            <span className="result-count">{result.onlyInGroup1.length} 人</span>
          </div>
          <div className="result-list">
            {result.onlyInGroup1.length > 0 ? (
              result.onlyInGroup1.map((name, index) => (
                <Tag key={index} color="blue">{name}</Tag>
              ))
            ) : (
              <span className="empty-text">无</span>
            )}
          </div>
        </div>
        
        <div className="result-section">
          <div className="result-header">
            <Tag color="orange">仅在组2</Tag>
            <span className="result-count">{result.onlyInGroup2.length} 人</span>
          </div>
          <div className="result-list">
            {result.onlyInGroup2.length > 0 ? (
              result.onlyInGroup2.map((name, index) => (
                <Tag key={index} color="orange">{name}</Tag>
              ))
            ) : (
              <span className="empty-text">无</span>
            )}
          </div>
        </div>
      </Space>
    </Card>
  );
}
