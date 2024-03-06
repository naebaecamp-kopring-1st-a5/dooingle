package com.dooingle.domain.dooingle.repository

import com.dooingle.domain.dooingle.dto.DooingleResponse
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Slice

interface DooingleQueryDslRepository {

    fun getDooinglesBySlice(cursor: Long?, pageable: Pageable): Slice<DooingleResponse>

    // TODO 팔로우 기능 구현 후 구현 필요
    // fun getDooinglePageableOfFollows(pageable: Pageable): Slice<Dooingle>
}
