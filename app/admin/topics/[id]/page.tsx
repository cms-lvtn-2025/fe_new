"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { createDetailSearch } from "@/lib/graphql/utils/search-helpers";
import { GET_TOPIC_DETAIL } from "@/lib/graphql/queries/admin";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Users,
  Award,
  Clock,
  TrendingUp,
  Star,
} from "lucide-react";
import { downloadFile } from "@/lib/api/file";

interface TopicDetail {
  id: string;
  title: string;
  majorCode: string;
  semesterCode: string;
  status: string;
  percentStage1: number;
  percentStage2: number;
  createdAt: string;
  updatedAt: string;
  backUrl?: string;
  files?: Array<{
    id: string;
    title: string;
    file: string;
    status: string;
  }>;
  topicCouncils?: Array<{
    id: string;
    title: string;
    stage: string;
    topicCode: string;
    councilCode: string;
    timeStart: string;
    timeEnd: string;
    enrollments?: Array<{
      id: string;
      title: string;
      studentCode: string;
      student?: {
        id: string;
        username: string;
        email: string;
      };
      midterm?: {
        id: string;
        grade: number | null;
        status: string;
        feedback?: string;
      };
      final?: {
        id: string;
        supervisorGrade: number | null;
        departmentGrade: number | null;
        finalGrade: number | null;
        status: string;
        notes?: string;
      };

      gradeDefences?: Array<{
        id: string;
        totalScore: number | null;
        note?: string;
        defence?: {
          id: string;
          position: string;
          teacher?: {
            id: string;
            username: string;
            email: string;
          };
        };
        criteria?: Array<{
          id: string;
          name: string;
          score: number;
          maxScore: number;
        }>;
      }>;
    }>;
    supervisors?: Array<{
      id: string;
      teacherSupervisorCode: string;
      teacher: {
        id: string;
        email: string;
        username: string;
      };
    }>;
  }>;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  IN_PROGRESS: "Đang thực hiện",
  COMPLETED: "Hoàn thành",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  APPROVED:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  IN_PROGRESS:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  COMPLETED:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

const STAGE_LABELS: Record<string, string> = {
  STAGE_DACN: "Giai đoạn 1 (ĐACN)",
  STAGE_LVTN: "Giai đoạn 2 (LVTN)",
};

export default function TopicDetailPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = params.id as string;
  const backUrl =
    new URLSearchParams(window.location.search).get("backUrl") ||
    "/admin/topics";
  const { data, loading, error } = useQuery(GET_TOPIC_DETAIL, {
    variables: { search: createDetailSearch(topicId) },
    skip: !topicId,
  });
  const handleDownloadFile = async (fileId: string,semesterCode: string, filename: string) => {
      try {
        await downloadFile(fileId, semesterCode || "", filename);
      } catch (error) {
        alert("Lỗi khi tải xuống file: " + (error as Error).message);
      }
    };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">
            Lỗi khi tải dữ liệu
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {error.message}
          </p>
          <button
            onClick={() => router.push(backUrl)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const topic = (data as any)?.affair?.topics?.data?.[0];

  if (!topic) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-medium mb-2">
            Không tìm thấy thông tin đề tài
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Vui lòng quay lại và chọn đề tài để xem chi tiết
          </p>
          <button
            onClick={() => router.push(backUrl)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push(backUrl)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors dark:text-gray-100 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Chi tiết Đề tài
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Mã: {topic.id}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              STATUS_COLORS[topic.status] || "bg-gray-100 text-gray-800"
            }`}
          >
            {STATUS_LABELS[topic.status] || topic.status}
          </span>
        </div>

        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Thông tin cơ bản
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Tên đề tài
              </label>
              <p className="mt-1 text-gray-900 dark:text-gray-100 font-medium">
                {topic.title}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Mã ngành
              </label>
              <p className="mt-1 text-gray-900 dark:text-gray-100">
                {topic.majorCode}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Học kỳ
              </label>
              <p className="mt-1 text-gray-900 dark:text-gray-100">
                {topic.semesterCode}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Tiến độ
              </label>
              <div className="mt-2 space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      Giai đoạn 1
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {topic.percentStage1}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${topic.percentStage1}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      Giai đoạn 2
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {topic.percentStage2}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${topic.percentStage2}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Topic Councils */}
        {topic.topicCouncils && topic.topicCouncils.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Hội đồng bảo vệ
            </h2>
            <div className="space-y-4">
              {topic.topicCouncils.map((tc: any) => (
                <div
                  key={tc.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {tc.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Hội đồng: {tc.councilCode}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                      {STAGE_LABELS[tc.stage] || tc.stage}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>
                        Bắt đầu:{" "}
                        {new Date(tc.timeStart).toLocaleString("vi-VN")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>
                        Kết thúc: {new Date(tc.timeEnd).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  </div>

                  {/* Supervisors */}
                  {tc.supervisors && tc.supervisors.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Giảng viên hướng dẫn:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {tc.supervisors.map((sup: any) => (
                          <button
                            key={sup.id}
                            onClick={() =>
                              router.push(
                                `/admin/teachers/${sup.teacher.id}?backUrl=/admin/topics/${topic.id}`
                              )
                            }
                            className="cursor-pointer px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                          >
                            {sup.teacher.username}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Students and Grades */}
                  {tc.enrollments && tc.enrollments.length > 0 && (
                    <div className="mt-3 space-y-4">
                      {tc.enrollments.map((enr: any) => (
                        <div
                          key={enr.id}
                          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          {/* Student Info */}
                          <div className="flex items-center justify-between mb-3">
                            <button
                              onClick={() => {
                                if (enr.student) {
                                  router.push(
                                    `/admin/students/${enr.studentCode}?backUrl=/admin/topics/${topic.id}`
                                  );
                                }
                              }}
                              disabled={!enr.student}
                              className="cursor-pointer flex items-center gap-2 text-gray-900 dark:text-gray-100 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                            >
                              <Users className="w-4 h-4" />
                              {enr.student?.username || enr.studentCode}
                            </button>
                          </div>

                          {/* Grades Section */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {/* Midterm Grade */}
                            {enr.midterm && (
                              <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                                <div className="flex items-center gap-2 mb-1">
                                  <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    Điểm giữa kỳ
                                  </span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                  {enr.midterm.grade !== null
                                    ? enr.midterm.grade
                                    : "--"}
                                </p>
                                {enr.midterm.feedback && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {enr.midterm.feedback}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Final Grades */}
                            {enr.final && (
                              <>
                                <div className="p-3 bg-white dark:bg-gray-800 rounded border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Award className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    <span className="text-xs font-medium text-green-700 dark:text-green-400">
                                      Điểm cuối kỳ
                                    </span>
                                  </div>
                                  <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                                    {enr.final.finalGrade !== null
                                      ? enr.final.finalGrade
                                      : "--"}
                                  </p>
                                </div>
                              </>
                            )}

                            {/* Grade Review */}
                          </div>

                          {/* Grade Defences (Council Grades) */}
                          {enr.gradeDefences &&
                            enr.gradeDefences.length > 0 && (
                              <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                  <Award className="w-5 h-5" />
                                  Điểm bảo vệ từ hội đồng
                                </p>
                                <div className="space-y-3">
                                  {enr.gradeDefences.map((gd: any) => (
                                    <div
                                      key={gd.id}
                                      className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm"
                                    >
                                      {/* Header: Teacher Info + Total Score */}
                                      <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                            <button
                                              onClick={() =>
                                                router.push(
                                                  `/admin/teachers/${gd.defence?.teacher?.id}?backUrl=/admin/topics/${topic.id}`
                                                )
                                              }
                                              className="hover:text-blue-600 cursor-pointer text-sm font-semibold text-gray-900 dark:text-gray-100"
                                            >
                                              {gd.defence?.teacher?.username ||
                                                "N/A"}
                                            </button>
                                          </div>
                                          <p className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                                            {gd.defence?.position ===
                                            "PRESIDENT"
                                              ? "Chủ tịch hội đồng"
                                              : gd.defence?.position ===
                                                "SECRETARY"
                                              ? "Thư ký hội đồng"
                                              : gd.defence?.position ===
                                                "REVIEWER"
                                              ? "Phản biện"
                                              : "Thành viên hội đồng"}
                                          </p>
                                          {gd.defence?.teacher?.email && (
                                            <p className="text-xs text-gray-400 dark:text-gray-500 ml-6">
                                              {gd.defence.teacher.email}
                                            </p>
                                          )}
                                        </div>
                                        <div className="text-right">
                                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                            Tổng điểm
                                          </p>
                                          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {gd.totalScore !== null
                                              ? gd.totalScore.toFixed(2)
                                              : "--"}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Criteria Breakdown */}
                                      {gd.criteria &&
                                        gd.criteria.length > 0 && (
                                          <div className="mb-3">
                                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                                              Chi tiết tiêu chí chấm:
                                            </p>
                                            <div className="space-y-2">
                                              {gd.criteria.map(
                                                (criterion: any) => (
                                                  <div
                                                    key={criterion.id}
                                                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                                                  >
                                                    <div className="flex-1">
                                                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                        {criterion.name}
                                                      </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                        {criterion.score}
                                                      </span>
                                                      <span className="text-xs text-gray-400 dark:text-gray-500">
                                                        / {criterion.maxScore}
                                                      </span>
                                                    </div>
                                                  </div>
                                                )
                                              )}
                                            </div>
                                          </div>
                                        )}

                                      {/* Notes */}
                                      {gd.note && (
                                        <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                                          <p className="text-xs font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                                            Ghi chú:
                                          </p>
                                          <p className="text-xs text-yellow-700 dark:text-yellow-400 italic">
                                            {gd.note}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files */}
        {topic.files && topic.files.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Tài liệu
            </h2>
            <div className="space-y-2">
              {topic.files.map((file: any) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {file.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Trạng thái: {file.status}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => handleDownloadFile(file.id, "", file.title)}
                    className="cursor-pointer px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                    Tải xuống
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Thông tin hệ thống
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">
                Ngày tạo:
              </span>
              <p className="text-gray-900 dark:text-gray-100 mt-1">
                {new Date(topic.createdAt).toLocaleString("vi-VN")}
              </p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">
                Cập nhật lần cuối:
              </span>
              <p className="text-gray-900 dark:text-gray-100 mt-1">
                {new Date(topic.updatedAt).toLocaleString("vi-VN")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
