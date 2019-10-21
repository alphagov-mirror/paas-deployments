export interface IWithGUID {
  readonly guid: string;
}

export interface IWithTimestamps {
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
}
