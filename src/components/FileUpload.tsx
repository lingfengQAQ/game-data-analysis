import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { parsePersonalInfoCSV, parseBattleDataCSV } from '../services/csvService';
import { usePlayerStore } from '../stores/playerStore';
import { useBattleDataStore } from '../stores/battleDataStore';
import { groupByGuild } from '../utils/dataUtils';

const { Dragger } = Upload;

interface FileUploadProps {
  type: 'personal' | 'battle';
}

export function FileUpload({ type }: FileUploadProps) {
  const setPlayers = usePlayerStore(state => state.setPlayers);
  const setGuildData = useBattleDataStore(state => state.setGuildData);

  const handleUpload = async (file: File) => {
    try {
      if (type === 'personal') {
        const players = await parsePersonalInfoCSV(file);
        setPlayers(players);
        message.success(`成功导入 ${players.length} 名玩家`);
      } else {
        const records = await parseBattleDataCSV(file);
        const guildData = groupByGuild(records);
        setGuildData(guildData);
        message.success(`成功导入 ${records.length} 条帮战记录，共 ${guildData.length} 个帮会`);
      }
    } catch (error: any) {
      message.error(`导入失败：${error.message}`);
      console.error('CSV 解析错误：', error);
    }
    return false; // 阻止自动上传
  };

  return (
    <Dragger
      accept=".csv"
      beforeUpload={handleUpload}
      showUploadList={false}
      multiple={false}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">
        点击或拖拽 CSV 文件到此区域上传
      </p>
      <p className="ant-upload-hint">
        {type === 'personal' ? '上传个人信息数据（包含角色名、战力、职业等字段）' : '上传帮战数据（包含帮会名、玩家、战斗数据等字段）'}
      </p>
    </Dragger>
  );
}
