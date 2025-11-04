import { useState } from 'react';
import { Button, Space, Modal, Input, message, Dropdown } from 'antd';
import { UploadOutlined, SaveOutlined, FolderOpenOutlined, ExportOutlined, DownOutlined, FileImageOutlined } from '@ant-design/icons';
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { PlayerList } from '../components/TeamConfig/PlayerList';
import { TeamBoard } from '../components/TeamConfig/TeamBoard';
import { FileUpload } from '../components/FileUpload';
import { usePlayerStore } from '../stores/playerStore';
import { useTeamStore } from '../stores/teamStore';
import { storageService } from '../services/storageService';
import { exportTeamConfigToCSV, exportTeamConfigToImage } from '../services/exportService';
import { Player, Position } from '../types';

export function TeamConfigPage() {
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [loadModalVisible, setLoadModalVisible] = useState(false);
  const [configName, setConfigName] = useState('');
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);

  const players = usePlayerStore(state => state.players);
  const configuration = useTeamStore(state => state.configuration);
  const saveConfiguration = useTeamStore(state => state.saveConfiguration);
  const loadConfiguration = useTeamStore(state => state.loadConfiguration);
  const addPlayerToTeam = useTeamStore(state => state.addPlayerToTeam);
  const movePlayer = useTeamStore(state => state.movePlayer);
  const removePlayerFromTeam = useTeamStore(state => state.removePlayerFromTeam);

  // 配置拖拽传感器，提高精确度
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 移动8px后才开始拖拽
      },
    })
  );

  const handleDragStart = (event: any) => {
    const activeData = event.active.data.current;
    if (activeData?.type === 'player') {
      setActivePlayer(activeData.player);
    } else if (activeData?.type === 'teamPlayer') {
      setActivePlayer(activeData.player);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActivePlayer(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // 从人员列表拖到团队
    if (activeData?.type === 'player' && overData?.type === 'slot') {
      const player: Player = activeData.player;
      const position: Position = overData.position;
      
      // 检查团队是否已满
      const regiment = configuration.regiments.find(r => r.id === position.regimentId);
      if (regiment) {
        const playerCount = regiment.squads.reduce(
          (count, squad) => count + squad.players.filter(p => p !== null).length,
          0
        );
        if (playerCount >= 30) {
          message.error('团队已满（30人）');
          return;
        }
      }
      
      addPlayerToTeam(position.regimentId, position.squadId, position.position, player);
    }

    // 在团队内移动
    if (activeData?.type === 'teamPlayer' && overData?.type === 'slot') {
      const from: Position = activeData.position;
      const to: Position = overData.position;
      movePlayer(from, to);
    }

    // 从团队拖回人员列表（移除玩家）
    if (activeData?.type === 'teamPlayer' && overData?.type === 'playerList') {
      const position: Position = activeData.position;
      removePlayerFromTeam(position);
      message.success('已移除玩家');
    }
  };

  const handleSave = () => {
    if (!configName.trim()) {
      message.error('请输入配置名称');
      return;
    }
    saveConfiguration(configName);
    message.success('配置已保存');
    setSaveModalVisible(false);
    setConfigName('');
  };

  const handleLoad = (id: string) => {
    loadConfiguration(id);
    message.success('配置已加载');
    setLoadModalVisible(false);
  };

  const handleExportCSV = () => {
    exportTeamConfigToCSV(configuration);
    message.success('CSV 配置已导出');
  };

  const handleExportImage = async () => {
    try {
      await exportTeamConfigToImage('team-board-export', `团队配置_${configuration.name}_${Date.now()}.png`);
      message.success('图片已导出');
    } catch (error) {
      message.error('导出图片失败');
    }
  };

  // 按堂口自动分配
  const handleAutoAssignByHall = () => {
    // 按堂口分组
    const hallGroups = new Map<string, Player[]>();
    players.forEach(player => {
      const hall = player.hall || '未分配';
      if (!hallGroups.has(hall)) {
        hallGroups.set(hall, []);
      }
      hallGroups.get(hall)!.push(player);
    });

    // 每个堂口内按战力排序
    hallGroups.forEach(group => {
      group.sort((a, b) => b.combatPower - a.combatPower);
    });

    // 清空当前配置
    const newConfig = {
      ...configuration,
      regiments: configuration.regiments.map(regiment => ({
        ...regiment,
        squads: regiment.squads.map(squad => ({
          ...squad,
          players: Array(6).fill(null)
        }))
      }))
    };

    // 按堂口分配到不同的团
    const halls = Array.from(hallGroups.keys());
    let currentRegimentIndex = 0;
    let currentSquadIndex = 0;
    let currentPositionIndex = 0;

    halls.forEach(hall => {
      const hallPlayers = hallGroups.get(hall)!;
      
      hallPlayers.forEach(player => {
        // 检查当前团是否已满（30人）
        const currentRegiment = newConfig.regiments[currentRegimentIndex];
        const playerCount = currentRegiment.squads.reduce(
          (count, squad) => count + squad.players.filter(p => p !== null).length,
          0
        );

        if (playerCount >= 30) {
          // 切换到下一个团
          currentRegimentIndex++;
          currentSquadIndex = 0;
          currentPositionIndex = 0;

          if (currentRegimentIndex >= 4) {
            message.warning('所有团队已满，部分玩家未分配');
            return;
          }
        }

        // 分配玩家
        const regiment = newConfig.regiments[currentRegimentIndex];
        const squad = regiment.squads[currentSquadIndex];
        squad.players[currentPositionIndex] = player;

        // 移动到下一个位置
        currentPositionIndex++;
        if (currentPositionIndex >= 6) {
          currentPositionIndex = 0;
          currentSquadIndex++;
          if (currentSquadIndex >= 5) {
            currentSquadIndex = 0;
            currentRegimentIndex++;
          }
        }
      });
    });

    useTeamStore.setState({ configuration: newConfig });
    message.success(`已按堂口自动分配 ${players.length} 名玩家`);
  };

  const savedConfigs = storageService.getAllConfigurations();

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button
              icon={<UploadOutlined />}
              onClick={() => setUploadModalVisible(true)}
            >
              导入玩家数据
            </Button>
            <Button
              type="primary"
              onClick={handleAutoAssignByHall}
              disabled={players.length === 0}
            >
              按堂口自动分配
            </Button>
            <Button
              icon={<SaveOutlined />}
              onClick={() => setSaveModalVisible(true)}
              disabled={players.length === 0}
            >
              保存配置
            </Button>
            <Button
              icon={<FolderOpenOutlined />}
              onClick={() => setLoadModalVisible(true)}
            >
              加载配置
            </Button>
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
                    key: 'image',
                    label: '导出为图片',
                    icon: <FileImageOutlined />,
                    onClick: handleExportImage
                  }
                ]
              }}
            >
              <Button icon={<ExportOutlined />}>
                导出配置 <DownOutlined />
              </Button>
            </Dropdown>
          </Space>
        </div>

        <div className="team-config-layout">
          <div className="player-list-panel">
            {players.length > 0 ? (
              <PlayerList />
            ) : (
              <div style={{ padding: 32, textAlign: 'center', color: '#999' }}>
                <p>暂无玩家数据</p>
                <Button type="primary" onClick={() => setUploadModalVisible(true)}>
                  导入玩家数据
                </Button>
              </div>
            )}
          </div>
          <div className="team-board-panel">
            <TeamBoard />
          </div>
        </div>

        {/* 上传模态框 */}
        <Modal
          title="导入玩家数据"
          open={uploadModalVisible}
          onCancel={() => setUploadModalVisible(false)}
          footer={null}
          width={600}
        >
          <FileUpload type="personal" />
        </Modal>

        {/* 保存配置模态框 */}
        <Modal
          title="保存配置"
          open={saveModalVisible}
          onOk={handleSave}
          onCancel={() => {
            setSaveModalVisible(false);
            setConfigName('');
          }}
        >
          <Input
            placeholder="请输入配置名称"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            onPressEnter={handleSave}
          />
        </Modal>

        {/* 加载配置模态框 */}
        <Modal
          title="加载配置"
          open={loadModalVisible}
          onCancel={() => setLoadModalVisible(false)}
          footer={null}
        >
          {savedConfigs.length > 0 ? (
            <div>
              {savedConfigs.map(config => (
                <div
                  key={config.id}
                  style={{
                    padding: 12,
                    marginBottom: 8,
                    border: '1px solid #d9d9d9',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                  onClick={() => handleLoad(config.id)}
                >
                  <div style={{ fontWeight: 600 }}>{config.name}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>
                    {new Date(config.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 32, color: '#999' }}>
              暂无保存的配置
            </div>
          )}
        </Modal>
      </div>
      
      <DragOverlay dropAnimation={null}>
        {activePlayer ? (
          <div
            style={{
              width: '120px',
              height: '80px',
              padding: '8px',
              backgroundColor: '#1890ff',
              color: 'white',
              borderRadius: '4px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              cursor: 'grabbing',
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ 
              fontSize: '13px', 
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {activePlayer.name}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600 }}>
                {activePlayer.combatPower.toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.9 }}>
                {activePlayer.class}
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
