package com.dooingle.domain.badreport.service

import com.dooingle.domain.badreport.dto.AddBadReportRequest
import com.dooingle.domain.badreport.dto.BadReportResponse
import com.dooingle.domain.badreport.dto.BlockBadReportDto
import com.dooingle.domain.badreport.model.ReportedTargetType
import com.dooingle.domain.badreport.repository.BadReportRepository
import com.dooingle.domain.user.repository.SocialUserRepository
import com.dooingle.global.exception.custom.ConflictStateException
import com.dooingle.global.exception.custom.ModelNotFoundException
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class BadReportService(
    private val socialUserRepository: SocialUserRepository,
    private val badReportRepository: BadReportRepository,
) {

    @Transactional
    fun addReport(reporterId: Long, addBadReportRequest: AddBadReportRequest) {
        val reporter = socialUserRepository.findByIdOrNull(reporterId)
            ?: throw ModelNotFoundException(modelName = "Social User", modelId = reporterId)

        // TODO 따닥 방지까지 고려 필요함

        val reportedList = badReportRepository.findByReportedTargetTypeAndReportedTargetId(
            addBadReportRequest.reportedTargetType,
            addBadReportRequest.reportedTargetId
        )
        check(reportedList.find { it.reporter.id == reporterId } == null) { throw ConflictStateException("이미 신고되었습니다.") }

        addBadReportRequest.toEntity(reporter).let { badReportRepository.save(it) }

        if (reportedList.size + 1 == TOTAL_REPORTED_NUMBER) {
            when (addBadReportRequest.reportedTargetType) {
                ReportedTargetType.DOOINGLE -> blockReportedDooingles(BlockBadReportDto(listOf(addBadReportRequest.reportedTargetId)))
                ReportedTargetType.CATCH -> blockReportedCatches(BlockBadReportDto(listOf(addBadReportRequest.reportedTargetId)))
            }
        }
    }

    fun getBadReportPagedList(reportedTargetType: ReportedTargetType, pageRequest: PageRequest): Page<BadReportResponse>? {
        return badReportRepository.findBadReportPage(reportedTargetType, pageRequest)
    }

    @Transactional
    fun blockReportedDooingles(request: BlockBadReportDto){
        badReportRepository.updateReportedDooingles(request.reportedIdList)
    }

    @Transactional
    fun blockReportedCatches(request: BlockBadReportDto){
        badReportRepository.updateReportedCatches(request.reportedIdList)
    }

    companion object {
        const val TOTAL_REPORTED_NUMBER: Int = 3
    }

}
