import React, { useEffect } from 'react';
import { Row, Col, Steps, message, Alert, Button } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import { useComparisonStore } from '../stores/comparisonStore';
import { ImageUploadSection } from '../components/ImageComparison/ImageUploadSection';
import { RecognitionResults } from '../components/ImageComparison/RecognitionResults';
import { ComparisonResults } from '../components/ImageComparison/ComparisonResults';
import { ocrService } from '../services/ocrService';
import { ImageFile } from '../types/comparison';

const { Step } = Steps;

export const ImageComparisonPage: React.FC = () => {
  const {
    group1Images,
    group2Images,
    group1Names,
    group2Names,
    isRecognizing,
    recognitionProgress,
    recognitionError,
    comparisonResult,
    addGroup1Image,
    addGroup2Image,
    removeGroup1Image,
    removeGroup2Image,
    setGroup1Names,
    setGroup2Names,
    setRecognizing,
    setRecognitionProgress,
    setRecognitionError,
    compareNames
  } = useComparisonStore();

  // 清理图片预览 URL
  useEffect(() => {
    return () => {
      [...group1Images, ...group2Images].forEach(image => {
        URL.revokeObjectURL(image.preview);
      });
    };
  }, [group1Images, group2Images]);

  // 检查是否可以开始识别
  const canRecognize = (group1Images.length > 0 || group2Images.length > 0) && !isRecognizing;

  // 计算当前步骤
  const getCurrentStep = () => {
    if (comparisonResult) return 2;
    if (group1Names.length > 0 || group2Names.length > 0) return 1;
    return 0;
  };

  // 处理图片上传 - 单个图片
  const handleGroup1ImageAdd = (image: ImageFile) => {
    addGroup1Image(image);
  };

  const handleGroup2ImageAdd = (image: ImageFile) => {
    addGroup2Image(image);
  };

  // 开始识别
  const handleRecognize = async () => {
    if (!ocrService.isConfigured()) {
      message.error('API 密钥未配置，请联系管理员');
      return;
    }

    setRecognizing(true);
    setRecognitionError(null);

    try {
      // 识别组1
      if (group1Images.length > 0) {
        const group1Files = group1Images.map(img => img.file);
        const names1 = await ocrService.recognizeImages(
          group1Files,
          (current, total) => setRecognitionProgress(current, total + group2Images.length)
        );
        setGroup1Names(names1);
      }

      // 识别组2
      if (group2Images.length > 0) {
        const group2Files = group2Images.map(img => img.file);
        const names2 = await ocrService.recognizeImages(
          group2Files,
          (current, total) => setRecognitionProgress(group1Images.length + current, group1Images.length + total)
        );
        setGroup2Names(names2);
      }

      message.success('识别完成！');
    } catch (error) {
      console.error('识别失败:', error);
      const errorMessage = error instanceof Error ? error.message : '识别失败，请重试';
      setRecognitionError(errorMessage);
      message.error(errorMessage);
    } finally {
      setRecognizing(false);
    }
  };

  // 开始对比
  const handleCompare = () => {
    if (group1Names.length === 0 && group2Names.length === 0) {
      message.warning('请先识别图片或手动输入角色名');
      return;
    }
    compareNames();
    message.success('对比完成！');
  };

  // 检查是否可以开始对比
  const canCompare = (group1Names.length > 0 || group2Names.length > 0) && !isRecognizing && !comparisonResult;



  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1>图片名单对比</h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>
          上传截图，自动识别角色名，对比两组名单的差异
        </p>

        {!ocrService.isConfigured() && (
          <Alert
            message="API 密钥未配置"
            description={
              <div>
                请联系管理员配置 DeepSeek-OCR API 密钥。
                <br />
                获取密钥：<a href="https://siliconflow.cn" target="_blank" rel="noopener noreferrer">硅基流动官网</a>
              </div>
            }
            type="warning"
            showIcon
            style={{ marginBottom: '24px' }}
          />
        )}

        <Steps current={getCurrentStep()} style={{ marginBottom: '32px' }}>
          <Step title="上传图片" description="选择要对比的截图" />
          <Step title="识别角色" description="自动识别图片中的角色名" />
          <Step title="对比结果" description="查看两组名单的差异" />
        </Steps>
      </div>

      {/* 图片上传区域 */}
      <Row gutter={24} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <ImageUploadSection
            title="组1 图片"
            images={group1Images}
            onAdd={handleGroup1ImageAdd}
            onRemove={removeGroup1Image}
          />
        </Col>
        <Col span={12}>
          <ImageUploadSection
            title="组2 图片"
            images={group2Images}
            onAdd={handleGroup2ImageAdd}
            onRemove={removeGroup2Image}
          />
        </Col>
      </Row>

      {/* 识别结果区域 */}
      <RecognitionResults
        group1Names={group1Names}
        group2Names={group2Names}
        isRecognizing={isRecognizing}
        progress={recognitionProgress}
        error={recognitionError}
        onGroup1Change={setGroup1Names}
        onGroup2Change={setGroup2Names}
        onRecognize={handleRecognize}
        canRecognize={canRecognize}
      />

      {/* 开始对比按钮 */}
      {canCompare && (
        <div style={{ textAlign: 'center', margin: '24px 0' }}>
          <Button
            type="primary"
            size="large"
            icon={<BarChartOutlined />}
            onClick={handleCompare}
          >
            开始对比
          </Button>
        </div>
      )}

      {/* 对比结果区域 */}
      {comparisonResult && <ComparisonResults result={comparisonResult} />}
    </div>
  );
};
