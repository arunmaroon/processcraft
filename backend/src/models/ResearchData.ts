import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ResearchDataAttributes {
  id: string;
  filename: string;
  original_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  content?: string;
  processed_content?: string;
  insights?: any;
  quality_score?: number;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  metadata?: any;
  created_at?: Date;
  updated_at?: Date;
}

export interface ResearchDataCreationAttributes extends Optional<ResearchDataAttributes, 'id' | 'created_at' | 'updated_at'> {}

export class ResearchData extends Model<ResearchDataAttributes, ResearchDataCreationAttributes> implements ResearchDataAttributes {
  public id!: string;
  public filename!: string;
  public original_name!: string;
  public file_type!: string;
  public file_size!: number;
  public file_path!: string;
  public content?: string;
  public processed_content?: string;
  public insights?: any;
  public quality_score?: number;
  public processing_status!: 'pending' | 'processing' | 'completed' | 'failed';
  public error_message?: string;
  public metadata?: any;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ResearchData.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    original_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    file_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    file_size: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    file_path: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    processed_content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    insights: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    quality_score: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
    },
    processing_status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'research_data',
    timestamps: true,
    indexes: [
      {
        fields: ['file_type'],
      },
      {
        fields: ['processing_status'],
      },
      {
        fields: ['created_at'],
      },
    ],
  }
);

export default ResearchData;















