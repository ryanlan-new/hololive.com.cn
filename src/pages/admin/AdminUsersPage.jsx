import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, User, UserX, X, Save, AlertTriangle } from "lucide-react";
import pb from "../../lib/pocketbase";
import { useTranslation } from "react-i18next";
import { useUIFeedback } from "../../hooks/useUIFeedback";

/**
 * 本地管理员账号管理页面
 * 管理 users 集合中的管理员账号
 */
export default function AdminUsersPage() {
  const { t } = useTranslation();
  const { notify } = useUIFeedback();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [enableLocalLogin, setEnableLocalLogin] = useState(true);
  const [updatingLoginSetting, setUpdatingLoginSetting] = useState(false);

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await pb.collection("users").getList(1, 100, {
        sort: "-created",
      });
      setUsers(result.items);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      const detail =
        error?.response?.data ||
        error?.data ||
        error?.response ||
        error?.message ||
        error;
      notify("Error fetching users: " + JSON.stringify(detail), "error");
    } finally {
      setLoading(false);
    }
  };

  // 获取本地登录开关状态
  const fetchLoginSetting = async () => {
    try {
      const settings = await pb.collection("system_settings").getOne("1");
      setEnableLocalLogin(settings?.enable_local_login ?? true);
    } catch (error) {
      console.error("Failed to fetch login setting:", error);
      // 如果读取失败，默认开启（安全回退）
      setEnableLocalLogin(true);
    }
  };

  // 更新本地登录开关
  const handleToggleLocalLogin = async (newValue) => {
    try {
      setUpdatingLoginSetting(true);
      await pb.collection("system_settings").update("1", {
        enable_local_login: newValue,
      });
      setEnableLocalLogin(newValue);
    } catch (error) {
      console.error("Failed to update login setting:", error);
      const detail =
        error?.response?.data ||
        error?.data ||
        error?.response ||
        error?.message ||
        error;
      notify("Error updating login setting: " + JSON.stringify(detail), "error");
    } finally {
      setUpdatingLoginSetting(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchLoginSetting();
  }, []);

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // 打开新建表单
  const handleNew = () => {
    setFormData({ email: "", password: "", passwordConfirm: "" });
    setShowForm(true);
  };

  // 创建新管理员
  const handleCreate = async (e) => {
    e.preventDefault();

    // 验证密码
    if (formData.password !== formData.passwordConfirm) {
      notify(t("admin.users.modal.passwordMismatch"), "warning");
      return;
    }

    if (formData.password.length < 8) {
      notify(t("admin.users.modal.passwordTooShort"), "warning");
      return;
    }

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        emailVisibility: true,
      };
      await pb.collection("users").create(payload);
      notify(t("admin.users.modal.success"), "success");
      setShowForm(false);
      setFormData({ email: "", password: "", passwordConfirm: "" });
      await fetchUsers();
    } catch (error) {
      console.error("Failed to create user:", error);
      const detail =
        error?.response?.data ||
        error?.data ||
        error?.response ||
        error?.message ||
        error;
      notify("Error creating user: " + JSON.stringify(detail), "error");
    }
  };

  // 禁用账号（将 verified 设为 false）
  const handleDisable = async (userId) => {
    try {
      await pb.collection("users").update(userId, {
        verified: false,
      });
      notify(t("admin.users.actions.deleted"), "success");
      await fetchUsers();
    } catch (error) {
      console.error("Failed to disable user:", error);
      const detail =
        error?.response?.data ||
        error?.data ||
        error?.response ||
        error?.message ||
        error;
      notify("Error disabling user: " + JSON.stringify(detail), "error");
    }
  };

  // 删除账号
  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await pb.collection("users").delete(id);
      await fetchUsers();
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
      const detail =
        error?.response?.data ||
        error?.data ||
        error?.response ||
        error?.message ||
        error;
      notify("Error deleting user: " + JSON.stringify(detail), "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 页面头部 */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("admin.users.title")}
            </h1>
            <p className="text-gray-600">{t("admin.users.subtitle")}</p>
          </div>
          <button
            onClick={handleNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            {t("admin.users.add")}
          </button>
        </div>

        {/* 本地登录开关设置区域 */}
        <div className="mb-6 rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-semibold text-amber-900">
                  {t("admin.users.toggle.title")}
                </h3>
              </div>
              <p className="text-sm text-amber-800 mb-3">
                {t("admin.users.toggle.desc")}
              </p>
              <p className="text-xs text-amber-700">
                {t("admin.users.toggle.sub")}
              </p>
            </div>
            <label className="flex items-center gap-3 cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={enableLocalLogin}
                onChange={(e) => handleToggleLocalLogin(e.target.checked)}
                disabled={updatingLoginSetting}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="text-sm font-medium text-amber-900">
                {enableLocalLogin ? t("admin.users.toggle.on") : t("admin.users.toggle.off")}
              </span>
              {updatingLoginSetting && (
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              )}
            </label>
          </div>
        </div>

        {/* 新建表单弹窗 */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("admin.users.modal.addTitle")}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ email: "", password: "", passwordConfirm: "" });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("admin.users.modal.email")}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("admin.users.modal.password")}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t("admin.users.modal.passwordHint")}
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("admin.users.modal.confirmPassword")}
                  </label>
                  <input
                    type="password"
                    value={formData.passwordConfirm}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passwordConfirm: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t("admin.users.modal.confirmPasswordHint")}
                    required
                    minLength={8}
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({ email: "", password: "", passwordConfirm: "" });
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  >
                    {t("admin.users.modal.cancel")}
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {t("admin.users.modal.create")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 用户列表 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">加载中...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">{t("admin.users.table.empty")}</p>
              <p className="text-gray-400 text-sm mb-6">
                {t("admin.users.table.emptyDesc")}
              </p>
              <button
                onClick={handleNew}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                {t("admin.users.add")}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("admin.users.table.avatar")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("admin.users.table.email")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("admin.users.table.status")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("admin.users.table.created")}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("admin.users.table.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.verified ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {t("admin.users.table.active")}
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            {t("admin.users.table.disabled")}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {user.verified && (
                            <button
                              onClick={() => handleDisable(user.id)}
                              className="text-orange-600 hover:text-orange-900 transition-colors"
                              title={t("admin.users.actions.disable")}
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteConfirmId(user.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            disabled={deletingId === user.id}
                            title="删除"
                          >
                            {deletingId === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 删除确认弹窗 */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("admin.users.delete.title")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("admin.users.delete.desc")}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                {t("admin.users.delete.cancel")}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deletingId === deleteConfirmId}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deletingId === deleteConfirmId && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {t("admin.users.delete.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
