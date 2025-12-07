import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Filter, ClipboardList } from "lucide-react";
import pb from "../../lib/pocketbase";

/**
 * 操作日志审计页面
 * 显示管理员和 SSO 用户的操作记录
 */
export default function AuditLogs() {
  const { adminKey } = useParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterActionType, setFilterActionType] = useState("");
  const [expandedLogId, setExpandedLogId] = useState(null);

  const pageSize = 20;

  // 操作类型选项
  const actionTypes = [
    { value: "", label: "全部类型" },
    { value: "登录", label: "登录" },
    { value: "创建", label: "创建" },
    { value: "更新", label: "更新" },
    { value: "删除", label: "删除" },
    { value: "系统设置", label: "系统设置" },
    { value: "其他", label: "其他" },
  ];

  // 获取日志列表
  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      // 构建查询条件
      let filter = "";
      if (filterActionType) {
        filter = `action_type="${filterActionType}"`;
      }

      // 获取日志列表（按时间倒序）
      const result = await pb.collection("audit_logs").getList(page, pageSize, {
        sort: "-created",
        filter: filter,
        expand: "user", // 展开用户信息
      });

      setLogs(result.items);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
      setError("获取日志列表失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, filterActionType]);

  // 格式化日期时间（中文习惯）
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  // 获取操作类型的颜色样式
  const getActionTypeColor = (actionType) => {
    const colors = {
      登录: "bg-blue-100 text-blue-800 border-blue-200",
      创建: "bg-emerald-100 text-emerald-800 border-emerald-200",
      更新: "bg-amber-100 text-amber-800 border-amber-200",
      删除: "bg-red-100 text-red-800 border-red-200",
      系统设置: "bg-purple-100 text-purple-800 border-purple-200",
      其他: "bg-slate-100 text-slate-800 border-slate-200",
    };
    return colors[actionType] || colors["其他"];
  };

  // 获取用户邮箱（从展开的用户信息中）
  const getUserEmail = (log) => {
    if (log.expand?.user?.email) {
      return log.expand.user.email;
    }
    return log.user || "未知用户";
  };

  return (
    <div className="space-y-4">
      {/* 页面头部 */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">
            操作日志
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            查看管理员和 SSO 用户的操作记录
          </p>
        </div>

        {/* 筛选器 */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={filterActionType}
            onChange={(e) => {
              setFilterActionType(e.target.value);
              setPage(1); // 重置到第一页
            }}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs md:text-sm text-slate-900 focus:border-[var(--color-brand-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)]/30"
          >
            {actionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs md:text-sm text-red-800">
          {error}
        </div>
      )}

      {/* 日志列表 */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <Loader2 className="w-7 h-7 animate-spin text-slate-400 mx-auto mb-3" />
          <p className="text-sm text-slate-500">正在加载日志...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 px-6 py-10 text-center shadow-sm flex flex-col items-center gap-3">
          <ClipboardList className="w-12 h-12 text-slate-300" />
          <p className="text-sm font-medium text-slate-700">
            {filterActionType ? "没有符合筛选条件的日志" : "当前还没有操作日志"}
          </p>
          <p className="text-xs text-slate-500">
            {filterActionType
              ? "尝试调整筛选条件或清空筛选。"
              : "操作日志将在管理员执行操作时自动记录。"}
          </p>
        </div>
      ) : (
        <>
          {/* 日志表格 */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      操作时间
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      操作人
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      操作类型
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      目标模块
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      详情
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() =>
                        setExpandedLogId(expandedLogId === log.id ? null : log.id)
                      }
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-xs md:text-sm text-slate-600">
                        {formatDateTime(log.created)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs md:text-sm text-slate-900">
                        {getUserEmail(log)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ${getActionTypeColor(
                            log.action_type
                          )}`}
                        >
                          {log.action_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs md:text-sm text-slate-700">
                        {log.target_module}
                      </td>
                      <td className="px-4 py-3 text-xs md:text-sm text-slate-600 max-w-xs truncate">
                        {log.details || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 分页控件 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                上一页
              </button>
              <span className="px-3 py-1.5 text-xs text-slate-600">
                第 {page} / {totalPages} 页
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

