import { Typography } from 'antd';

export default function SuggestedSQLFinished() {
  return (
    <>
      <Typography.Text className="gray-8">
        Using suggested query
      </Typography.Text>
      <div className="gray-7 text-sm mt-1">
        A prepared SQL query matched this suggested question and was used
        directly.
      </div>
    </>
  );
}
