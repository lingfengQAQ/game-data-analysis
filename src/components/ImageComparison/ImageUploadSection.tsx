import { Upload, Card, Image, Button, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { ImageFile } from '../../types/comparison';
import './styles.css';

interface ImageUploadSectionProps {
  title: string;
  images: ImageFile[];
  onAdd: (image: ImageFile) => void;
  onRemove: (id: string) => void;
  maxCount?: number;
}

export function ImageUploadSection({
  title,
  images,
  onAdd,
  onRemove,
  maxCount = 10
}: ImageUploadSectionProps) {
  
  const handleFileChange = async (file: File) => {
    // 验证文件
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      message.error('只支持 PNG、JPG、JPEG、WebP 格式');
      return false;
    }
    
    if (file.size > maxSize) {
      message.error('图片大小不能超过 10MB');
      return false;
    }
    
    if (images.length >= maxCount) {
      message.error(`最多只能上传 ${maxCount} 张图片`);
      return false;
    }
    
    // 创建预览 URL
    const preview = URL.createObjectURL(file);
    
    const imageFile: ImageFile = {
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview
    };
    
    onAdd(imageFile);
    return false; // 阻止自动上传
  };

  return (
    <Card title={title} className="image-upload-section">
      <div className="image-list">
        {images.map((img) => (
          <div key={img.id} className="image-item">
            <Image
              src={img.preview}
              alt={img.file.name}
              width={100}
              height={100}
              style={{ objectFit: 'cover' }}
            />
            <div className="image-info">
              <div className="image-name">{img.file.name}</div>
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => onRemove(img.id)}
              >
                删除
              </Button>
            </div>
          </div>
        ))}
        
        {images.length < maxCount && (
          <Upload
            beforeUpload={handleFileChange}
            showUploadList={false}
            accept="image/png,image/jpeg,image/jpg,image/webp"
          >
            <div className="upload-button">
              <PlusOutlined />
              <div>添加图片</div>
              <div className="upload-hint">
                {images.length}/{maxCount}
              </div>
            </div>
          </Upload>
        )}
      </div>
    </Card>
  );
}
