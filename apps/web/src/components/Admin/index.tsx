import AdminWeb3Provider from "./AdminWeb3Provider";
import SmartContractControlPanel from "./SmartContractControlPanel";

const AdminPanel = () => {
  return (
    <AdminWeb3Provider>
      <SmartContractControlPanel />
    </AdminWeb3Provider>
  );
};

export default AdminPanel;
