import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { parsePersonalInfoCSV, parseBattleDataCSV } from '../../services/csvService';
import { usePlayerStore } from '../../stores/playerStore';
import { useBattleDataStore } from '../../stores/battleDataStore';
import { groupByGuild } from '../../utils/dataUtils';

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
        message.success(`成功导入 ${guildData.length} 个帮会的数据，共 ${records.length} 条记录`);
      }
    } catch (error) {
      message.error(`导入失败: ${error instanceof Error ? error.message : '未知错误'}`);
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
        {type === 'personal' 
          ? '支持个人信息 CSV 文件（包含名称、总战力、职业等字段）'
          : '支持帮战数据 CSV 文件（包含帮会名、玩家、击败、助攻等字段）'
        }
      </p>
    </Dragger>
  );
}
