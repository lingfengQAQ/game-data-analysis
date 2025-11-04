import { Card, Button, Input, Progress, Space, Alert } from 'antd';
import { ScanOutlined } from '@ant-design/icons';
import { RecognitionProgress } from '../../types/comparison';

const { TextArea } = Input;

interface RecognitionResultsProps {
  group1Names: string[];
  group2Names: string[];
  isRecognizing: boolean;
  progress: RecognitionProgress;
  error: string | null;
  onGroup1Change: (names: string[]) => void;
  onGroup2Change: (names: string[]) => void;
  onRecognize: () => void;
  canRecognize: boolean;
}

export function RecognitionResults({
  group1Names,
  group2Names,
  isRecognizing,
  progress,
  error,
  onGroup1Change,
  onGroup2Change,
  onRecognize,
  canRecognize
}: RecognitionResultsProps) {
  
  const handleGroup1Change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const names = e.target.value.split('\n').filter(name => name.trim());
    onGroup1Change(names);
  };
  
  const handleGroup2Change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const names = e.target.value.split('\n').filter(name => name.trim());
    onGroup2Change(names);
  };
  
  const progressPercent = progress.total > 0 
    ? Math.round((progress.current / progress.total) * 100) 
    : 0;

  return (
    <Card title="识别结果" className="recognition-results">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {error && (
          <Alert message="识别失败" description={error} type="error" closable />
        )}
        
        <div style={{ textAlign: 'center' }}>
          <Button
            type="primary"
            size="large"
            icon={<ScanOutlined />}
            onClick={onRecognize}
            loading={isRecognizing}
            disabled={!canRecognize || isRecognizing}
          >
            {isRecognizing ? '识别中...' : '开始识别'}
          </Button>
          
          {isRecognizing && (
            <div style={{ marginTop: 16 }}>
              <Progress 
                percent={progressPercent} 
                status="active"
                format={() => `${progress.current}/${progress.total}`}
              />
            </div>
          )}
        </div>
        
        <div className="names-editor">
          <div className="names-group">
            <div className="names-header">
              <span>组1角色名</span>
              <span className="names-count">共 {group1Names.length} 人</span>
            </div>
            <TextArea
              value={group1Names.join('\n')}
              onChange={handleGroup1Change}
              placeholder="每行一个角色名"
              rows={10}
              disabled={isRecognizing}
            />
          </div>
          
          <div className="names-group">
            <div className="names-header">
              <span>组2角色名</span>
              <span className="names-count">共 {group2Names.length} 人</span>
            </div>
            <TextArea
              value={group2Names.join('\n')}
              onChange={handleGroup2Change}
              placeholder="每行一个角色名"
              rows={10}
              disabled={isRecognizing}
            />
          </div>
        </div>
      </Space>
    </Card>
  );
}
