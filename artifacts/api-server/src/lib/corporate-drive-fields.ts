export function stripCorporateDriveFields<T extends Record<string, unknown>>(data: T) {
  const {
    drive_folder_id: _driveFolderId,
    drive_folder_name: _driveFolderName,
    ...safe
  } = data;
  return safe;
}