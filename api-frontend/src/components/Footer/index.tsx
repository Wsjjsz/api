import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import '@umijs/max';
const Footer: React.FC = () => {
  const defaultMessage = '蚂蚁集团体验技术部出品';
  const currentYear = new Date().getFullYear();
  const repoUrl = 'https://github.com/Wsjjsz/api';
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright={`${currentYear} ${defaultMessage}`}
      links={[
        {
          key: 'API接口',
          title: 'API接口',
          href: repoUrl,
          blankTarget: true,
        },
        {
          key: 'github',
          title: <GithubOutlined />,
          href: repoUrl,
          blankTarget: true,
        },
      ]}
    />
  );
};
export default Footer;
