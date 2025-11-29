"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { createDetailSearch } from "@/lib/graphql/utils/search-helpers";
import { GET_MY_ENROLLMENT_DETAIL } from "@/lib/graphql/queries/student";
import {
  downloadFile,
  deleteFile,
  getFileURL,
  getFileBlobURL,
  uploadMidtermFile,
  uploadFinalFile,
} from "@/lib/api/file";
import {
  ArrowLeft,
  FileText,
  Upload,
  CheckCircle,
  User,
  Award,
  Calendar,
  Download,
  Trash2,
  Eye,
} from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useSemester } from "@/lib/contexts/semester-context";

const STATUS_LABELS: Record<string, string> = {
  SUBMIT: "Đã nộp",
  TOPIC_PENDING: "Chờ duyệt",
  APPROVED_1: "Duyệt lần 1",
  APPROVED_2: "Duyệt lần 2",
  IN_PROGRESS: "Đang thực hiện",
  TOPIC_COMPLETED: "Hoàn thành",
  REJECTED: "Từ chối",
};

const STAGE_LABELS: Record<string, string> = {
  STAGE_1: "Giai đoạn 1",
  STAGE_2: "Giai đoạn 2",
};

export default function ThesisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: enrollmentId } = use(params);
  const [midtermFileInput, setMidtermFileInput] = useState<File | null>(null);
  const [finalFileInput, setFinalFileInput] = useState<File | null>(null);
  console.log("Enrollment ID:", enrollmentId);
  const { data, loading, error, refetch } = useQuery(GET_MY_ENROLLMENT_DETAIL, {
    variables: { search: createDetailSearch(enrollmentId) },
    skip: !enrollmentId,
  });
  const semesterCode = useSemester();

  const [uploadingMidterm, setUploadingMidterm] = useState(false);
  const [uploadingFinal, setUploadingFinal] = useState(false);

  const handleBack = () => {
    router.push("/student/thesis");
  };

  const canUploadMidterm = () => {
    if (!midtermGrade?.id) {
      return false;
    }
    const status = midtermGrade.status?.toUpperCase();
    return status !== "PASS" && status !== "FAIL";
  };

  const canUploadFinal = () => {
    if (!finalGrade?.id) {
      return false;
    }
    const status = finalGrade.status?.toUpperCase();
    return status !== "PASS" && status !== "FAIL";
  };

  const handleUploadMidterm = async () => {
    if (!midtermFileInput) {
      alert("Vui lòng chọn file");
      return;
    }

    if (!midtermGrade?.id) {
      alert("Chưa có thông tin giữa kỳ. Vui lòng liên hệ quản trị viên.");
      return;
    }

    const status = midtermGrade.status?.toUpperCase();
    if (status === "PASS" || status === "FAIL") {
      alert("Không thể upload file. Giữa kỳ đã được đánh giá (PASS/FAIL).");
      return;
    }

    setUploadingMidterm(true);
    try {
      await uploadMidtermFile(
        midtermFileInput,
        midtermGrade.id,
        semesterCode.currentSemester?.id || "",
        midtermFileInput.name,
        enrollmentId
      );
      alert("Đã tải lên file giữa kỳ thành công!");
      setMidtermFileInput(null);
      // Refetch to get updated data
      refetch();
    } catch (error) {
      alert("Lỗi khi tải lên file: " + (error as Error).message);
    } finally {
      setUploadingMidterm(false);
    }
  };

  const handleUploadFinal = async () => {
    if (!finalFileInput) {
      alert("Vui lòng chọn file");
      return;
    }

    if (!finalGrade?.id) {
      alert("Chưa có thông tin cuối kỳ. Vui lòng liên hệ quản trị viên.");
      return;
    }

    const status = finalGrade.status?.toUpperCase();
    if (status === "PASS" || status === "FAIL") {
      alert("Không thể upload file. Cuối kỳ đã được đánh giá (PASS/FAIL).");
      return;
    }

    setUploadingFinal(true);
    try {
      await uploadFinalFile(
        finalFileInput,
        finalGrade.id,
        semesterCode.currentSemester?.id || "",
        finalFileInput.name,
        enrollmentId
      );
      alert("Đã tải lên file cuối kỳ thành công!");
      setFinalFileInput(null);
      // Refetch to get updated data
      refetch();
    } catch (error) {
      alert("Lỗi khi tải lên file: " + (error as Error).message);
    } finally {
      setUploadingFinal(false);
    }
  };

  const handleDownloadFile = async (fileId: string, filename: string) => {
    try {
      await downloadFile(fileId, semesterCode.currentSemester?.id || "", filename);
    } catch (error) {
      alert("Lỗi khi tải xuống file: " + (error as Error).message);
    }
  };

  const handleDeleteFile = async (fileId: string, fileTitle: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa file "${fileTitle}"?`)) {
      return;
    }

    try {
      await deleteFile(fileId);
      alert("Đã xóa file thành công!");
      refetch();
    } catch (error) {
      alert("Lỗi khi xóa file: " + (error as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">
          Lỗi: {error.message}
        </p>
        <button
          onClick={() => router.push("/student/thesis")}
          className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const enrollment = (data as any)?.student?.enrollments?.data?.[0];

  if (!enrollment) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">
          Không tìm thấy thông tin luận văn {enrollmentId}
        </p>
        <button
          onClick={() => router.push("/student/thesis")}
          className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const topic = enrollment.topic || enrollment.topicCouncil?.topic;
  const topicCouncil = enrollment.topicCouncil;
  const supervisors = topicCouncil?.supervisors || [];
  const gradeTopicCouncils = enrollment.gradeTopicCouncils || [];
  const gradeDefences = enrollment.gradeDefences || [];
  const midtermGrade = enrollment.midterm;
  const finalGrade = enrollment.final;

  // Calculate average scores
  const midtermGrades = gradeTopicCouncils.filter(
    (g: any) => g.midtermScore !== null && g.midtermScore !== undefined
  );
  const finalGrades = gradeTopicCouncils.filter(
    (g: any) => g.finalScore !== null && g.finalScore !== undefined
  );
  const avgMidterm =
    midtermGrades.length > 0
      ? (
          midtermGrades.reduce(
            (sum: number, g: any) => sum + g.midtermScore,
            0
          ) / midtermGrades.length
        ).toFixed(2)
      : null;
  const avgFinal =
    finalGrades.length > 0
      ? (
          finalGrades.reduce((sum: number, g: any) => sum + g.finalScore, 0) /
          finalGrades.length
        ).toFixed(2)
      : null;

  // Calculate average defence score
  const defenceGrades = gradeDefences.filter(
    (g: any) => g.totalScore !== null && g.totalScore !== undefined
  );
  const avgDefence =
    defenceGrades.length > 0
      ? (
          defenceGrades.reduce((sum: number, g: any) => sum + g.totalScore, 0) /
          defenceGrades.length
        ).toFixed(2)
      : null;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Chi tiết luận văn
        </h1>
      </div>

      {/* Topic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {topic?.title || "N/A"}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-mono">{topic?.id || "N/A"}</span>
              <span>•</span>
              <span>{topic?.major?.title || "N/A"}</span>
              <span>•</span>
              <span>{topic?.semester?.title || "N/A"}</span>
            </div>
          </div>
          <StatusBadge
            status={topic?.status || "UNKNOWN"}
            label={STATUS_LABELS[topic?.status] || topic?.status || "N/A"}
          />
        </div>

        {/* Topic Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Giai đoạn
            </h3>
            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm rounded">
              {STAGE_LABELS[topicCouncil?.stage] ||
                topicCouncil?.stage ||
                "N/A"}
            </span>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Lịch bảo vệ
            </h3>
            {topicCouncil?.timeStart ? (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-gray-900 dark:text-gray-100">
                    {new Date(topicCouncil.timeStart).toLocaleDateString(
                      "vi-VN"
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(topicCouncil.timeStart).toLocaleTimeString(
                      "vi-VN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <span className="text-sm text-gray-400 dark:text-gray-500">
                Chưa có lịch
              </span>
            )}
          </div>

          {topic?.description && (
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Mô tả đề tài
              </h3>
              <div
                className="text-sm text-gray-900 dark:text-gray-100 prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: topic.description }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Supervisors */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Giảng viên hướng dẫn
        </h2>
        {supervisors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supervisors.map((supervisor: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {supervisor.teacher?.fullname ||
                      supervisor.teacher?.username ||
                      "N/A"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {supervisor.teacher?.email || ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            Chưa có giảng viên hướng dẫn
          </p>
        )}
      </div>

      {/* File Upload Section */}
      {topic.status === "IN_PROGRESS" && (<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Nộp file luận văn
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Midterm File Upload */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              File giữa kỳ
            </h3>

            {/* Display midterm files */}
            {midtermGrade?.files && midtermGrade.files.length > 0 ? (
              <div className="space-y-3 mb-4">
                {midtermGrade.files.map((file: any) => (
                  <div
                    key={file.id}
                    className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium text-sm">
                          {file.title}
                        </span>
                      </div>
                      <StatusBadge status={file.status} label={file.status} />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadFile(file.id, file.title)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Tải xuống
                      </button>
                      {midtermGrade.status == "NOT_SUBMITTED" && (
                        <button
                          onClick={() => handleDeleteFile(file.id, file.title)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Upload new midterm file */}
            {midtermGrade.status == "NOT_SUBMITTED" && (
              <div className="space-y-3">
                <input
                  key={`midterm-${
                    midtermFileInput ? midtermFileInput.name : "empty"
                  }`}
                  type="file"
                  onChange={(e) =>
                    setMidtermFileInput(e.target.files?.[0] || null)
                  }
                  accept=".pdf,.doc,.docx"
                  className="block w-full py-10 text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none"
                  style={{ padding: "20px" }}
                />
                {midtermFileInput && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Đã chọn: {midtermFileInput.name}
                  </p>
                )}
                {!midtermGrade?.id ? (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    Chưa có thông tin giữa kỳ. Vui lòng liên hệ quản trị viên.
                  </p>
                ) : midtermGrade.status?.toUpperCase() === "PASS" ||
                  midtermGrade.status?.toUpperCase() === "FAIL" ? (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Không thể upload file. Giữa kỳ đã được đánh giá (
                    {midtermGrade.status}).
                  </p>
                ) : null}
                <button
                  onClick={handleUploadMidterm}
                  disabled={
                    !midtermFileInput || uploadingMidterm || !canUploadMidterm()
                  }
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {uploadingMidterm
                    ? "Đang tải lên..."
                    : "Tải lên file giữa kỳ"}
                </button>
              </div>
            )}
          </div>

          {/* Final File Upload */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              File cuối kỳ
            </h3>

            {/* Display final files */}
            {finalGrade?.files && finalGrade.files.length > 0 ? (
              <div className="space-y-3 mb-4">
                {finalGrade.files.map((file: any) => (
                  <div
                    key={file.id}
                    className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium text-sm">
                          {file.title}
                        </span>
                      </div>
                      <StatusBadge status={file.status} label={file.status} />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadFile(file.id, file.title)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Tải xuống
                      </button>
                      {finalGrade.status == "PENDING" && (
                        <button
                          onClick={() => handleDeleteFile(file.id, file.title)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Upload new final file */}
            {finalGrade.status == "PENDING" && (
              <div className="space-y-3">
                <input
                  key={`final-${
                    finalFileInput ? finalFileInput.name : "empty"
                  }`}
                  type="file"
                  onChange={(e) =>
                    setFinalFileInput(e.target.files?.[0] || null)
                  }
                  accept=".pdf,.doc,.docx"
                  className="block w-full text-sm text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none"
                  style={{ padding: "20px" }}
                />
                {finalFileInput && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Đã chọn: {finalFileInput.name}
                  </p>
                )}
                {!finalGrade?.id ? (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    Chưa có thông tin cuối kỳ. Vui lòng liên hệ quản trị viên.
                  </p>
                ) : finalGrade.status?.toUpperCase() === "PASS" ||
                  finalGrade.status?.toUpperCase() === "FAIL" ? (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Không thể upload file. Cuối kỳ đã được đánh giá (
                    {finalGrade.status}).
                  </p>
                ) : null}
                <button
                  onClick={handleUploadFinal}
                  disabled={
                    !finalFileInput || uploadingFinal || !canUploadFinal()
                  }
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  {uploadingFinal ? "Đang tải lên..." : "Tải lên file cuối kỳ"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>)}

      {/* Midterm and Final Details Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Chi tiết điểm và phản hồi
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Midterm Details */}
          {midtermGrade && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-500" />
                Giữa kỳ
              </h3>

              {midtermGrade.title && (
                <div className="mb-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Tiêu đề:
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {midtermGrade.title}
                  </p>
                </div>
              )}

              <div className="mb-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Điểm:
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {midtermGrade.grade !== null &&
                  midtermGrade.grade !== undefined
                    ? midtermGrade.grade.toFixed(2)
                    : "Chưa có điểm"}
                </p>
              </div>

              <div className="mb-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Trạng thái:
                </p>
                <StatusBadge
                  status={midtermGrade.status}
                  label={midtermGrade.status}
                />
              </div>

              {midtermGrade.feedback && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Phản hồi:
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {midtermGrade.feedback}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Final Details */}
          {finalGrade && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-green-500" />
                Cuối kỳ
              </h3>

              {finalGrade.title && (
                <div className="mb-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Tiêu đề:
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {finalGrade.title}
                  </p>
                </div>
              )}

              <div className="mb-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Điểm:
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {midtermGrade.grade !== null &&
                  midtermGrade.grade !== undefined
                    ? midtermGrade.grade.toFixed(2)
                    : "Chưa có điểm"}
                </p>
              </div>

              <div className="mb-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Trạng thái:
                </p>
                <StatusBadge
                  status={finalGrade.status}
                  label={finalGrade.status}
                />
              </div>

              {finalGrade.notes && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Ghi chú:
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {finalGrade.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {!midtermGrade && !finalGrade && (
            <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
              Chưa có thông tin điểm và phản hồi
            </div>
          )}
        </div>
      </div>

      {/* Grades Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Điểm số
        </h2>

        {/* Average Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Điểm giữa kỳ
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {midtermGrade?.grade?.toFixed(2) || "Chưa có"}
                </p>
              </div>
              <Award className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Điểm cuối kỳ
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {finalGrade?.finalGrade?.toFixed(2) || "Chưa có"}
                </p>
              </div>
              <Award className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Điểm hội đồng (TB)
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {avgDefence || "Chưa có"}
                </p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Defence Council Grades */}
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
          Chi tiết điểm hội đồng bảo vệ
        </h3>
        <div className="space-y-4">
          {gradeDefences.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              Chưa có điểm hội đồng
            </p>
          ) : (
            gradeDefences.map((gradeDefence: any, idx: number) => (
              <div
                key={idx}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {"Hội đồng " + (idx + 1)}
                      </div>
                      
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Tổng điểm
                    </div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {gradeDefence.totalScore !== null &&
                      gradeDefence.totalScore !== undefined
                        ? gradeDefence.totalScore.toFixed(2)
                        : "-"}
                    </div>
                  </div>
                </div>

                {/* Criteria Breakdown */}
                {gradeDefence.criteria && gradeDefence.criteria.length > 0 && (
                  <div className="mt-3 border-t border-gray-200 dark:border-gray-600 pt-3">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Chi tiết theo tiêu chí:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {gradeDefence.criteria.map(
                        (criterion: any, cIdx: number) => (
                          <div
                            key={cIdx}
                            className="flex justify-between text-sm bg-white dark:bg-gray-800 px-3 py-2 rounded"
                          >
                            <span className="text-gray-700 dark:text-gray-300">
                              {criterion.name}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {criterion.score !== null &&
                              criterion.score !== undefined
                                ? `${criterion.score}/${criterion.maxScore}`
                                : "-"}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Note */}
                {gradeDefence.note && (
                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Ghi chú:</span>{" "}
                    {gradeDefence.note}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
