import { useState } from 'react';
import { Layout, Menu, Typography } from 'antd';
import { TeamOutlined, BarChartOutlined } from '@ant-design/icons';
import { TeamConfigPage } from './pages/TeamConfigPage';
import { BattleDataAnalysisPage } from './pages/BattleDataAnalysisPage';
import './styles/global.css';

const { Header, Content } = Layout;
const { Title } = Typography;

type PageType = 'team-config' | 'battle-data';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('team-config');

  return (
    <Layout className="app-container">
      <Header className="app-header">
        <Title level={3} style={{ margin: 0, color: '#fff' }}>
          游戏帮会管理系统
        </Title>
        <Menu
          mode="horizontal"
          selectedKeys={[currentPage]}
          onClick={({ key }) => setCurrentPage(key as PageType)}
          style={{ flex: 1, minWidth: 0, marginLeft: 32 }}
          items={[
            {
              key: 'team-config',
              icon: <TeamOutlined />,
              label: '团队配置'
            },
            {
              key: 'battle-data',
              icon: <BarChartOutlined />,
              label: '帮战数据分析'
            }
          ]}
        />
      </Header>
      <Content className="app-content">
        {currentPage === 'team-config' && <TeamConfigPage />}
        {currentPage === 'battle-data' && <BattleDataAnalysisPage />}
      </Content>
    </Layout>
  );
}

export default App;
