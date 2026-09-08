<template>
  <div class="settings-container">
    <a-card class="settings-card">
      <div class="settings-page-head">
        <div>
          <div class="settings-page-title">{{ settingsPageTitle }}</div>
          <div class="settings-page-description">{{ settingsPageDescription }}</div>
        </div>
      </div>
      <a-spin :spinning="loading">
        <a-form
          :model="formState"
          :label-col="{ span: 4 }"
          :wrapper-col="{ span: 14 }"
          layout="horizontal"
          class="settings-form"
        >
          <a-tabs>
            <a-tab-pane v-for="group in configGroups" :key="group" :tab="getGroupName(group)">
              <template v-if="group === 'event'">
                <div class="event-config-layout">
                  <div class="event-rule-grid">
                    <a-card
                      v-for="card in eventRuleCards"
                      :key="card.id"
                      class="event-rule-card"
                      :bordered="false"
                    >
                      <template #title>活动 {{ card.id }}</template>
                      <a-form-item
                        v-for="config in card.configs"
                        :key="config.key"
                        :label="config.description"
                        :name="config.key"
                        class="event-form-item"
                        :label-col="{ span: 24 }"
                        :wrapper-col="{ span: 24 }"
                      >
                        <a-textarea
                          v-if="[LANDING_BRAND_DESCRIPTION_KEY, LANDING_TESTIMONIAL_TEXT_KEY].includes(config.key)"
                          v-model:value="formState[config.key]"
                          :rows="4"
                          :placeholder="`请输入${config.description}`"
                        />

                        <a-input
                          v-else-if="config.type === 'string'"
                          v-model:value="formState[config.key]"
                          :placeholder="`请输入${config.description}`"
                        />
                        <a-input-number
                          v-else
                          v-model:value="formState[config.key]"
                          :min="0"
                          :step="getNumberStep(config.key)"
                          :precision="getNumberPrecision(config.key)"
                          style="width: 100%"
                        />
                      </a-form-item>
                    </a-card>
                  </div>

                  <a-card class="event-condition-card" :bordered="false" title="活动说明">
                    <a-form-item
                      v-for="config in eventConditionConfigs"
                      :key="config.key"
                      :label="config.description"
                      :name="config.key"
                      class="event-form-item"
                      :label-col="{ span: 24 }"
                      :wrapper-col="{ span: 24 }"
                    >
                      <a-input
                        v-model:value="formState[config.key]"
                        :placeholder="`请输入${config.description}`"
                      />
                    </a-form-item>
                  </a-card>
                </div>
              </template>
              <template v-else-if="group === 'checkin'">
                <div class="checkin-config-layout">
                  <div class="checkin-reward-grid">
                    <a-card
                      v-for="card in checkinRewardCards"
                      :key="card.id"
                      class="checkin-reward-card"
                      :bordered="false"
                    >
                      <template #title>签到奖励 {{ card.id }}</template>
                      <a-form-item
                        v-for="config in card.configs"
                        :key="config.key"
                        :label="config.description"
                        :name="config.key"
                        class="event-form-item"
                        :label-col="{ span: 24 }"
                        :wrapper-col="{ span: 24 }"
                      >
                        <a-input-number
                          v-model:value="formState[config.key]"
                          :min="0"
                          :step="getNumberStep(config.key)"
                          :precision="getNumberPrecision(config.key)"
                          style="width: 100%"
                        />
                      </a-form-item>
                    </a-card>
                  </div>

                  <a-card
                    v-if="checkinNoticeConfig"
                    class="checkin-notice-card"
                    :bordered="false"
                    title="签到公告"
                  >
                    <a-form-item
                      :label="checkinNoticeConfig.description"
                      :name="checkinNoticeConfig.key"
                      class="event-form-item"
                      :label-col="{ span: 24 }"
                      :wrapper-col="{ span: 24 }"
                    >
                      <a-input
                        v-model:value="formState[checkinNoticeConfig.key]"
                        :placeholder="`请输入${checkinNoticeConfig.description}`"
                      />
                    </a-form-item>
                  </a-card>
                </div>
              </template>
              <template v-else-if="group === 'partner'">
                <div class="partner-config-layout">
                  <a-card class="partner-list-card" :bordered="false" title="合作商列表">
                    <div class="partner-list-toolbar">
                      <a-button type="dashed" @click="addPartnerRanking">
                        新增合作商
                      </a-button>
                    </div>

                    <div v-if="partnerRankings.length" class="partner-ranking-list">
                      <div
                        v-for="(item, index) in partnerRankings"
                        :key="item.uid"
                        class="partner-ranking-item"
                      >
                        <div class="partner-ranking-index">{{ index + 1 }}</div>

                        <div class="partner-ranking-fields">
                          <a-form-item
                            label="合作商名称"
                            class="event-form-item"
                            :label-col="{ span: 24 }"
                            :wrapper-col="{ span: 24 }"
                          >
                            <a-input
                              v-model:value="item.name"
                              placeholder="请输入合作商名称"
                              @change="syncPartnerRankings"
                            />
                          </a-form-item>

                          <a-form-item
                            label="Logo"
                            class="event-form-item"
                            :label-col="{ span: 24 }"
                            :wrapper-col="{ span: 24 }"
                          >
                            <a-upload
                              :file-list="getPartnerLogoFileList(item)"
                              list-type="picture-card"
                              :show-upload-list="false"
                              accept="image/*"
                              :custom-request="options => handlePartnerLogoUpload(item, options)"
                            >
                              <img
                                v-if="item.logo"
                                :src="resolveSettingImageUrl(item.logo)"
                                alt="logo"
                                class="partner-logo-preview"
                              />
                              <div v-else>
                                <plus-outlined />
                                <div style="margin-top: 8px">上传</div>
                              </div>
                            </a-upload>
                          </a-form-item>
                        </div>

                        <div class="partner-ranking-actions">
                          <a-button size="small" @click="movePartnerRanking(index, -1)" :disabled="index === 0">
                            上移
                          </a-button>
                          <a-button
                            size="small"
                            @click="movePartnerRanking(index, 1)"
                            :disabled="index === partnerRankings.length - 1"
                          >
                            下移
                          </a-button>
                          <a-button danger size="small" @click="removePartnerRanking(index)">
                            删除
                          </a-button>
                        </div>
                      </div>
                    </div>

                    <a-empty v-else description="暂无合作商，请先添加" />
                  </a-card>
                </div>
              </template>
              <template v-else-if="group === 'about'">
                <div class="about-config-layout">
                  <a-card
                    v-for="section in aboutConfigSections"
                    :key="section.id"
                    class="about-section-card"
                    :bordered="false"
                  >
                    <template #title>{{ section.title }}</template>
                    <div v-if="section.description" class="about-section-description">
                      {{ section.description }}
                    </div>

                    <div class="about-section-grid" :class="{ single: section.singleColumn }">
                      <a-form-item
                        v-for="config in section.configs"
                        :key="config.key"
                        :label="config.description"
                        :name="config.key"
                        :class="[
                          'about-form-item',
                          { 'about-form-item-full': ['text', 'images'].includes(config.type) }
                        ]"
                        :label-col="{ span: 24 }"
                        :wrapper-col="{ span: 24 }"
                      >
                        <a-textarea
                          v-if="[LANDING_BRAND_DESCRIPTION_KEY, LANDING_TESTIMONIAL_TEXT_KEY].includes(config.key)"
                          v-model:value="formState[config.key]"
                          :rows="4"
                          :placeholder="`请输入${config.description}`"
                        />

                        <a-input
                          v-else-if="config.type === 'string'"
                          v-model:value="formState[config.key]"
                          :placeholder="`请输入${config.description}`"
                        />

                        <div
                          v-else-if="config.type === 'text'"
                          class="text-input-wrapper"
                          @click="openRichEditor(config.key, config.description)"
                        >
                          <a-input
                            :value="getTextPreview(formState[config.key])"
                            :placeholder="`点击编辑${config.description}`"
                            readonly
                            style="cursor: pointer;"
                          >
                            <template #suffix>
                              <EditOutlined style="color: #1890ff;" />
                            </template>
                          </a-input>
                        </div>

                        <a-upload
                          v-else-if="config.type === 'images'"
                          v-model:file-list="imageFiles[config.key]"
                          list-type="picture-card"
                          :custom-request="options => handleUpload(config.key, options)"
                          @change="handleImageChange(config.key, $event)"
                        >
                          <div>
                            <plus-outlined />
                            <div style="margin-top: 8px">上传</div>
                          </div>
                        </a-upload>

                        <a-input
                          v-else
                          v-model:value="formState[config.key]"
                          :placeholder="`请输入${config.description}`"
                        />
                      </a-form-item>
                    </div>
                  </a-card>
                </div>
              </template>
              <template v-else-if="group === 'landing'">
                <div class="landing-config-layout">
                  <a-card
                    v-if="landingHeroVideoConfig || landingHeroPosterConfig"
                    class="landing-section-card"
                    :bordered="false"
                  >
                    <template #title>第一部分：视频 / 轮播图</template>
                    <div class="landing-section-description">
                      可切换首屏使用视频或轮播图。视频模式可上传视频和封面图，轮播图模式可上传多张图片。
                    </div>

                    <div class="website-section-grid">
                      <a-form-item
                        v-if="landingHeroMediaTypeConfig"
                        :label="landingHeroMediaTypeConfig.description"
                        :name="landingHeroMediaTypeConfig.key"
                        class="website-form-item"
                        :label-col="{ span: 24 }"
                        :wrapper-col="{ span: 24 }"
                      >
                        <a-select
                          v-model:value="formState[landingHeroMediaTypeConfig.key]"
                          :options="landingHeroMediaTypeOptions"
                          placeholder="请选择首屏资源类型"
                        />
                      </a-form-item>

                      <a-form-item
                        v-if="landingHeroVideoConfig && formState[LANDING_HERO_MEDIA_TYPE_KEY] === 'video'"
                        :label="landingHeroVideoConfig.description"
                        :name="landingHeroVideoConfig.key"
                        class="website-form-item website-form-item-full"
                        :label-col="{ span: 24 }"
                        :wrapper-col="{ span: 24 }"
                      >
                        <div class="media-upload-wrapper">
                          <video
                            v-if="formState[landingHeroVideoConfig.key]"
                            class="settings-video-preview"
                            :src="resolveSettingImageUrl(formState[landingHeroVideoConfig.key])"
                            controls
                            muted
                            playsinline
                          />
                          <div class="media-upload-actions">
                            <a-upload
                              :show-upload-list="false"
                              accept="video/mp4,video/webm,video/ogg,video/quicktime"
                              :custom-request="options => handleMediaUpload(landingHeroVideoConfig.key, options)"
                            >
                              <a-button type="primary">上传视频</a-button>
                            </a-upload>
                            <a-button
                              v-if="formState[landingHeroVideoConfig.key]"
                              danger
                              @click="clearMediaConfig(landingHeroVideoConfig.key)"
                            >
                              清除
                            </a-button>
                          </div>
                        </div>
                      </a-form-item>

                      <a-form-item
                        v-if="landingHeroPosterConfig && formState[LANDING_HERO_MEDIA_TYPE_KEY] === 'video'"
                        :label="landingHeroPosterConfig.description"
                        :name="landingHeroPosterConfig.key"
                        class="website-form-item website-form-item-full"
                        :label-col="{ span: 24 }"
                        :wrapper-col="{ span: 24 }"
                      >
                        <a-upload
                          v-model:file-list="imageFiles[landingHeroPosterConfig.key]"
                          list-type="picture-card"
                          :custom-request="options => handleUpload(landingHeroPosterConfig.key, options)"
                          @change="handleImageChange(landingHeroPosterConfig.key, $event)"
                        >
                          <div>
                            <plus-outlined />
                            <div style="margin-top: 8px">上传</div>
                          </div>
                        </a-upload>
                      </a-form-item>

                      <a-form-item
                        v-if="landingGalleryImagesConfig && formState[LANDING_HERO_MEDIA_TYPE_KEY] === 'carousel'"
                        :label="landingGalleryImagesConfig.description"
                        :name="landingGalleryImagesConfig.key"
                        class="website-form-item website-form-item-full"
                        :label-col="{ span: 24 }"
                        :wrapper-col="{ span: 24 }"
                      >
                        <a-upload
                          v-model:file-list="imageFiles[landingGalleryImagesConfig.key]"
                          list-type="picture-card"
                          :custom-request="options => handleUpload(landingGalleryImagesConfig.key, options)"
                          @change="handleImageChange(landingGalleryImagesConfig.key, $event)"
                        >
                          <div>
                            <plus-outlined />
                            <div style="margin-top: 8px">上传</div>
                          </div>
                        </a-upload>
                      </a-form-item>
                    </div>
                  </a-card>

                  <a-card
                    v-if="landingStoryImagesConfig"
                    class="landing-section-card"
                    :bordered="false"
                  >
                    <template #title>第三部分：4张图片</template>
                    <div class="landing-section-description">
                      管理案例区的 4 张图片，前台按上传顺序取前 4 张。
                    </div>

                    <a-upload
                      v-model:file-list="imageFiles[landingStoryImagesConfig.key]"
                      list-type="picture-card"
                      :custom-request="options => handleUpload(landingStoryImagesConfig.key, options)"
                      @change="handleImageChange(landingStoryImagesConfig.key, $event)"
                    >
                      <div v-if="(imageFiles[landingStoryImagesConfig.key] || []).length < 4">
                        <plus-outlined />
                        <div style="margin-top: 8px">上传</div>
                      </div>
                    </a-upload>
                  </a-card>

                  <a-card
                    v-if="landingClientsLogosConfig"
                    class="landing-section-card"
                    :bordered="false"
                  >
                    <template #title>第四部分：Logo</template>
                    <div class="landing-section-description">
                      管理客户 Logo 列表，支持多图上传。
                    </div>

                    <a-upload
                      v-model:file-list="imageFiles[landingClientsLogosConfig.key]"
                      list-type="picture-card"
                      :custom-request="options => handleUpload(landingClientsLogosConfig.key, options)"
                      @change="handleImageChange(landingClientsLogosConfig.key, $event)"
                    >
                      <div>
                        <plus-outlined />
                        <div style="margin-top: 8px">上传</div>
                      </div>
                    </a-upload>
                  </a-card>
                </div>
              </template>
              <template v-else-if="group === 'maintenance'">
                <div class="maintenance-config-layout">
                  <a-card
                    v-if="maintenanceEnabledConfig || maintenancePageContentConfig"
                    class="maintenance-section-card"
                    :bordered="false"
                  >
                    <template #title>网站维护设置</template>
                    <div class="maintenance-section-description">
                      开启后，用户端进入任意页面都会统一显示维护页。维护页内容使用整页富文本编辑，可统一控制标题、正文、图片与排版。
                    </div>

                    <div class="maintenance-config-grid">
                      <a-form-item
                        v-if="maintenanceEnabledConfig"
                        :label="maintenanceEnabledConfig.description"
                        :name="maintenanceEnabledConfig.key"
                        class="maintenance-form-item"
                        :label-col="{ span: 24 }"
                        :wrapper-col="{ span: 24 }"
                      >
                        <a-switch
                          v-model:checked="formState[maintenanceEnabledConfig.key]"
                          checked-children="开启"
                          un-checked-children="关闭"
                        />
                      </a-form-item>

                      <a-form-item
                        v-if="maintenancePageContentConfig"
                        :label="maintenancePageContentConfig.description"
                        :name="maintenancePageContentConfig.key"
                        class="maintenance-form-item maintenance-form-item-full"
                        :label-col="{ span: 24 }"
                        :wrapper-col="{ span: 24 }"
                      >
                        <div class="text-input-wrapper" @click="openRichEditor(maintenancePageContentConfig.key, maintenancePageContentConfig.description)">
                          <a-input
                            :value="getTextPreview(formState[maintenancePageContentConfig.key])"
                            :placeholder="`点击编辑${maintenancePageContentConfig.description}`"
                            readonly
                            style="cursor: pointer;"
                          >
                            <template #suffix>
                              <EditOutlined style="color: #1890ff;" />
                            </template>
                          </a-input>
                        </div>
                      </a-form-item>
                    </div>
                  </a-card>
                </div>
              </template>
              <template v-else-if="group === 'website'">
                <div class="website-config-layout">
                  <a-card
                    v-if="websiteGeneralConfigs.length"
                    class="website-section-card"
                    :bordered="false"
                  >
                    <template #title>网站基础配置</template>
                    <div class="website-section-description">
                      管理首页、联系我们、证书页以及 PC 兼容模式等基础内容。
                    </div>

                    <div class="website-section-grid">
                      <a-form-item
                        v-for="config in websiteGeneralConfigs"
                        :key="config.key"
                        :label="config.description"
                        :name="config.key"
                        :class="[
                          'website-form-item',
                          { 'website-form-item-full': ['text', 'images'].includes(config.type) || isVideoUploadConfig(config.key) }
                        ]"
                        :label-col="{ span: 24 }"
                        :wrapper-col="{ span: 24 }"
                      >
                        <a-select
                          v-if="isDesktopFrameBackgroundTypeConfig(config.key)"
                          v-model:value="formState[config.key]"
                          :options="desktopFrameBackgroundTypeOptions"
                          placeholder="请选择背景类型"
                        />

                        <div v-else-if="isVideoUploadConfig(config.key)" class="media-upload-wrapper">
                          <video
                            v-if="formState[config.key]"
                            class="settings-video-preview"
                            :src="resolveSettingImageUrl(formState[config.key])"
                            controls
                            muted
                            playsinline
                          />
                          <div class="media-upload-actions">
                            <a-upload
                              :show-upload-list="false"
                              accept="video/mp4,video/webm,video/ogg,video/quicktime"
                              :custom-request="options => handleMediaUpload(config.key, options)"
                            >
                              <a-button>{{ formState[config.key] ? '重新上传视频' : '上传视频' }}</a-button>
                            </a-upload>
                            <a-button v-if="formState[config.key]" danger @click="clearMediaConfig(config.key)">
                              清空
                            </a-button>
                          </div>
                          <div v-if="formState[config.key]" class="media-upload-path">
                            {{ formState[config.key] }}
                          </div>
                        </div>

                        <a-input
                          v-else-if="config.type === 'string'"
                          v-model:value="formState[config.key]"
                          :placeholder="`请输入${config.description}`"
                        />

                        <a-input-number
                          v-else-if="config.type === 'number'"
                          v-model:value="formState[config.key]"
                          :min="0"
                          :step="getNumberStep(config.key)"
                          :precision="getNumberPrecision(config.key)"
                          style="width: 100%"
                          :addon-after="getNumberUnit(config.key)"
                        />

                        <a-switch
                          v-else-if="config.type === 'boolean'"
                          v-model:checked="formState[config.key]"
                          checked-children="开启"
                          un-checked-children="关闭"
                        />

                        <a-time-picker
                          v-else-if="isTimeConfig(config.key)"
                          v-model:value="formState[config.key]"
                          format="HH:mm"
                          style="width: 100%"
                          value-format="HH:mm"
                        />

                        <a-textarea
                          v-else-if="config.type === 'json'"
                          v-model:value="formState[config.key]"
                          :rows="4"
                          :placeholder="`请输入JSON格式的${config.description}`"
                        />

                        <div
                          v-else-if="config.type === 'text'"
                          class="text-input-wrapper"
                          @click="openRichEditor(config.key, config.description)"
                        >
                          <a-input
                            :value="getTextPreview(formState[config.key])"
                            :placeholder="`点击编辑${config.description}`"
                            readonly
                            style="cursor: pointer;"
                          >
                            <template #suffix>
                              <EditOutlined style="color: #1890ff;" />
                            </template>
                          </a-input>
                        </div>

                        <a-upload
                          v-else-if="config.type === 'images'"
                          v-model:file-list="imageFiles[config.key]"
                          list-type="picture-card"
                          :custom-request="options => handleUpload(config.key, options)"
                          @change="handleImageChange(config.key, $event)"
                        >
                          <div>
                            <plus-outlined />
                            <div style="margin-top: 8px">上传</div>
                          </div>
                        </a-upload>

                        <a-input
                          v-else
                          v-model:value="formState[config.key]"
                          :placeholder="`请输入${config.description}`"
                        />
                      </a-form-item>
                    </div>
                  </a-card>

                </div>
              </template>
              <template v-else-if="group === 'process_review'">
                <div class="process-review-config-layout">
                  <a-card
                    v-if="processReviewQuestionConfig || processNoticeConfig"
                    class="process-review-section-card"
                    :bordered="false"
                  >
                    <a-form-item
                      v-if="processNoticeConfig"
                      :label="processNoticeConfig.description"
                      :name="processNoticeConfig.key"
                      class="website-form-item"
                      :label-col="{ span: 24 }"
                      :wrapper-col="{ span: 24 }"
                    >
                      <a-textarea
                        v-model:value="formState[processNoticeConfig.key]"
                        :placeholder="`请输入${processNoticeConfig.description}`"
                        :auto-size="{ minRows: 2, maxRows: 4 }"
                      />
                    </a-form-item>

                    <div class="review-question-config">
                      <div class="review-question-toolbar">
                        <span class="review-question-toolbar-tip">支持分页编辑、批量导入、复制排序。前台仍会从全部题目中随机抽取。</span>
                        <div class="review-question-toolbar-actions">
                          <a-button @click="collapseAllProcessReviewQuestions">
                            全部折叠
                          </a-button>
                          <a-button @click="expandAllProcessReviewQuestions">
                            全部展开
                          </a-button>
                          <a-button @click="openProcessReviewImportModal">
                            批量导入
                          </a-button>
                          <a-button type="primary" @click="addProcessReviewQuestion">
                            新增问题
                          </a-button>
                        </div>
                      </div>

                      <div v-if="processReviewQuestions.length" class="review-question-list">
                        <div
                          v-for="entry in paginatedProcessReviewQuestions"
                          :key="entry.item.uid"
                          class="review-question-card"
                        >
                          <div class="review-question-header">
                            <div class="review-question-header-main">
                              <span class="review-question-index">问题 {{ entry.index + 1 }}</span>
                              <span class="review-question-answer-count">{{ entry.item.answers.length }} 个答案</span>
                            </div>
                            <div class="review-question-actions">
                              <a-button type="text" @click="toggleProcessReviewQuestionExpanded(entry.item.uid)">
                                {{ isProcessReviewQuestionExpanded(entry.item.uid) ? '折叠答案' : '展开答案' }}
                              </a-button>
                              <a-button type="text" @click="moveProcessReviewQuestion(entry.index, -1)" :disabled="entry.index === 0">
                                上移
                              </a-button>
                              <a-button
                                type="text"
                                @click="moveProcessReviewQuestion(entry.index, 1)"
                                :disabled="entry.index === processReviewQuestions.length - 1"
                              >
                                下移
                              </a-button>
                              <a-button type="text" @click="duplicateProcessReviewQuestion(entry.index)">
                                复制
                              </a-button>
                              <a-button danger type="text" @click="removeProcessReviewQuestion(entry.index)">
                                删除
                              </a-button>
                            </div>
                          </div>

                          <div class="review-question-field">
                            <div class="review-question-field-label">问题内容</div>
                            <a-textarea
                              v-model:value="entry.item.question"
                              placeholder="请输入问题内容"
                              :auto-size="{ minRows: 2, maxRows: 4 }"
                            />
                          </div>

                          <div v-if="isProcessReviewQuestionExpanded(entry.item.uid)" class="review-question-detail">
                            <div class="review-answer-toolbar">
                              <span class="review-answer-label">答案选项</span>
                              <a-button type="link" @click="addProcessReviewAnswer(entry.index)">
                                新增答案
                              </a-button>
                            </div>

                            <div class="review-answer-list">
                              <div
                                v-for="(answer, answerIndex) in entry.item.answers"
                                :key="answer.uid"
                                class="review-answer-item"
                              >
                                <div class="review-answer-index">{{ answerIndex + 1 }}</div>
                                <a-textarea
                                  v-model:value="answer.text"
                                  :placeholder="`请输入答案 ${answerIndex + 1}`"
                                  :auto-size="{ minRows: 1, maxRows: 3 }"
                                />
                                <div class="review-answer-actions">
                                  <a-button type="text" @click="moveProcessReviewAnswer(entry.index, answerIndex, -1)" :disabled="answerIndex === 0">
                                    上移
                                  </a-button>
                                  <a-button
                                    type="text"
                                    @click="moveProcessReviewAnswer(entry.index, answerIndex, 1)"
                                    :disabled="answerIndex === entry.item.answers.length - 1"
                                  >
                                    下移
                                  </a-button>
                                  <a-button danger type="text" @click="removeProcessReviewAnswer(entry.index, answerIndex)">
                                    删除
                                  </a-button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div class="review-question-pagination">
                          <a-pagination
                            v-model:current="processReviewCurrentPage"
                            v-model:page-size="processReviewPageSize"
                            :total="processReviewQuestions.length"
                            :show-size-changer="true"
                            :page-size-options="['5', '10', '20', '50']"
                            :show-total="total => `共 ${total} 题`"
                          />
                        </div>
                      </div>

                      <div v-else class="review-question-empty">
                        <a-empty description="暂无题目，请先添加" />
                        <a-button type="dashed" @click="addProcessReviewQuestion">
                          立即新增第一题
                        </a-button>
                      </div>
                    </div>
                  </a-card>
                </div>
              </template>
              <template v-else-if="group === 'order'">
                <div class="website-config-layout">
                  <a-card class="website-section-card" :bordered="false">
                    <template #title>非卡单刷单金额范围</template>
                    <div class="website-section-description">
                      仅影响自动刷单。商品价格会落在「可用余额 × 最低占比」到「可用余额 × 最高占比」之间。卡单（中台手动派单）不受此限制。
                      例如可用余额 1000、设置为 30%~80% 时，只派发 300~800 的商品。
                    </div>
                    <div class="website-section-grid">
                      <a-form-item
                        v-for="config in getConfigsByGroup('order')"
                        :key="config.key"
                        :label="config.description"
                        :name="config.key"
                        class="website-form-item"
                        :label-col="{ span: 24 }"
                        :wrapper-col="{ span: 24 }"
                      >
                        <a-input-number
                          v-model:value="formState[config.key]"
                          :min="0.01"
                          :max="100"
                          :step="1"
                          :precision="0"
                          style="width: 100%"
                          addon-after="%"
                        />
                      </a-form-item>
                    </div>
                  </a-card>
                </div>
              </template>
              <template v-else-if="group === PAGE_CONTENT_GROUP">
                <div class="page-content-config-layout">
                  <a-card
                    v-for="config in fullPageEditorConfigs"
                    :key="config.key"
                    class="page-content-section-card"
                    :bordered="false"
                  >
                    <template #title>{{ config.description }}</template>
                    <div v-if="config.pageTip" class="page-content-section-description">
                      {{ config.pageTip }}
                    </div>

                    <div class="page-content-panel">
                      <div class="text-input-wrapper page-content-editor-trigger" @click="openRichEditor(config.key, config.description)">
                        <a-input
                          :value="getTextPreview(formState[config.key])"
                          :placeholder="`点击编辑${config.description}`"
                          readonly
                          style="cursor: pointer;"
                        >
                          <template #suffix>
                            <EditOutlined style="color: #1890ff;" />
                          </template>
                        </a-input>
                      </div>
                    </div>
                  </a-card>
                </div>
              </template>
              <template v-else>
                <template v-for="config in getConfigsByGroup(group)" :key="config.key">
                  <a-form-item :label="config.description" :name="config.key">
                    <!-- 字符串类型 -->
                    <a-select
                      v-if="isDesktopFrameBackgroundTypeConfig(config.key)"
                      v-model:value="formState[config.key]"
                      :options="desktopFrameBackgroundTypeOptions"
                      placeholder="请选择背景类型"
                    />

                    <div v-else-if="isVideoUploadConfig(config.key)" class="media-upload-wrapper">
                      <video
                        v-if="formState[config.key]"
                        class="settings-video-preview"
                        :src="resolveSettingImageUrl(formState[config.key])"
                        controls
                        muted
                        playsinline
                      />
                      <div class="media-upload-actions">
                        <a-upload
                          :show-upload-list="false"
                          accept="video/mp4,video/webm,video/ogg,video/quicktime"
                          :custom-request="options => handleMediaUpload(config.key, options)"
                        >
                          <a-button>{{ formState[config.key] ? '重新上传视频' : '上传视频' }}</a-button>
                        </a-upload>
                        <a-button v-if="formState[config.key]" danger @click="clearMediaConfig(config.key)">
                          清空
                        </a-button>
                      </div>
                      <div v-if="formState[config.key]" class="media-upload-path">
                        {{ formState[config.key] }}
                      </div>
                    </div>

                    <a-input
                      v-else-if="config.type === 'string'"
                      v-model:value="formState[config.key]"
                      :placeholder="`请输入${config.description}`"
                    />

                    <!-- 数字类型 -->
                    <a-input-number
                      v-else-if="config.type === 'number'"
                      v-model:value="formState[config.key]"
                      :min="0"
                      :step="getNumberStep(config.key)"
                      :precision="getNumberPrecision(config.key)"
                      style="width: 100%"
                      :addon-after="getNumberUnit(config.key)"
                    />

                    <!-- 布尔类型 -->
                    <a-switch
                      v-else-if="config.type === 'boolean'"
                      v-model:checked="formState[config.key]"
                      checked-children="开启"
                      un-checked-children="关闭"
                    />

                    <!-- 时间类型 -->
                    <a-time-picker
                      v-else-if="isTimeConfig(config.key)"
                      v-model:value="formState[config.key]"
                      format="HH:mm"
                      style="width: 100%"
                      value-format="HH:mm"
                    />

                    <!-- JSON类型 -->
                    <a-textarea
                      v-else-if="config.type === 'json'"
                      v-model:value="formState[config.key]"
                      :rows="4"
                      :placeholder="`请输入JSON格式的${config.description}`"
                    />

                    <div
                      v-else-if="config.type === 'text'"
                      class="text-input-wrapper"
                      @click="openRichEditor(config.key, config.description)"
                    >
                      <a-input
                        :value="getTextPreview(formState[config.key])"
                        :placeholder="`点击编辑${config.description}`"
                        readonly
                        style="cursor: pointer;"
                      >
                        <template #suffix>
                          <EditOutlined style="color: #1890ff;" />
                        </template>
                      </a-input>
                    </div>

                    <a-upload
                      v-else-if="config.type === 'images'"
                      v-model:file-list="imageFiles[config.key]"
                      list-type="picture-card"
                      :custom-request="(options) => handleUpload(config.key, options)"
                      @change="handleImageChange(config.key, $event)"
                    >
                      <div>
                        <plus-outlined />
                        <div style="margin-top: 8px">上传</div>
                      </div>
                    </a-upload>

                    <a-input
                      v-else
                      v-model:value="formState[config.key]"
                      :placeholder="`请输入${config.description}`"
                    />

                    <template #help>{{ config.description }}</template>
                  </a-form-item>
                </template>
              </template>
            </a-tab-pane>
          </a-tabs>

          <div class="form-actions">
            <a-button type="primary" :loading="loading" @click="saveSettings">
              保存设置
            </a-button>
            <a-button style="margin-left: 8px" @click="resetSettings">
              重置
            </a-button>
          </div>
        </a-form>
      </a-spin>
    </a-card>

    <a-modal
      v-model:open="richEditorVisible"
      :title="`编辑 ${currentEditTitle}`"
      width="70%"
      :bodyStyle="{ padding: '0' }"
      :destroyOnClose="true"
      @ok="saveRichContent"
      @cancel="cancelRichEdit"
      ok-text="保存"
      cancel-text="取消"
      centered
    >
      <div v-if="richEditorVisible" class="rich-editor-modal">
        <Toolbar
          :key="`toolbar-${richEditorSessionKey}`"
          style="border-bottom: 1px solid #ccc"
          :editor="editorRef"
          :defaultConfig="toolbarConfig"
          :mode="mode"
        />
        <Editor
          :key="`editor-${richEditorSessionKey}`"
          style="height: 400px; overflow-y: hidden;"
          v-model="tempRichContent"
          :defaultConfig="editorConfig"
          :mode="mode"
          @onCreated="handleCreated"
        />
      </div>
    </a-modal>

    <a-modal
      v-model:open="processReviewImportVisible"
      title="批量导入题库"
      width="760px"
      @ok="applyProcessReviewImport"
      @cancel="closeProcessReviewImportModal"
      ok-text="导入"
      cancel-text="取消"
    >
      <div class="process-review-import-modal">
        <div class="process-review-import-help">
          <div class="process-review-import-help-title">导入格式</div>
          <div class="process-review-import-help-text">每个问题以 `Q数字.` 开头，答案以 `A.` `B.` `C.` 等开头。支持一次性粘贴多题。</div>
          <pre class="process-review-import-example">Q98. [Brand] provides good customer support.
A. Excellent
B. Good
C. Average
D. Poor
E. I don't know / I've never heard of this brand</pre>
        </div>

        <a-radio-group v-model:value="processReviewImportMode" class="process-review-import-mode">
          <a-radio-button value="append">追加导入</a-radio-button>
          <a-radio-button value="replace">覆盖现有题库</a-radio-button>
        </a-radio-group>

        <a-textarea
          v-model:value="processReviewImportText"
          :rows="14"
          placeholder="请粘贴题库文本"
        />
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, shallowRef, onBeforeUnmount, watch } from 'vue'
import { message } from 'ant-design-vue'
import { getAllConfig, updateConfig } from '@/api/config'
import { uploadImage, uploadMedia } from '@/api/upload'
import { PlusOutlined, EditOutlined } from '@ant-design/icons-vue'
import moment from 'moment'
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

const loading = ref(false)
const configData = ref([])
const formState = reactive({})
const imageFiles = reactive({})
const originalFormState = ref({})
const partnerRankings = ref([])
const processReviewQuestions = ref([])
const landingStoryCards = ref([])
const landingNavItems = ref([])
const landingFooterUsefulLinks = ref([])
const landingFooterCapabilities = ref([])
const landingFooterSocialLinks = ref([])
const faqItems = ref([])
const processReviewCurrentPage = ref(1)
const processReviewPageSize = ref(10)
const processReviewImportVisible = ref(false)
const processReviewImportMode = ref('append')
const processReviewImportText = ref('')
const expandedProcessReviewQuestionUids = ref([])

const configGroups = ref([])
const settingsPageTitle = computed(() => '网站配置')
const settingsPageDescription = computed(() => '在同一入口下统一维护网站基础配置、维护设置与落地页资源设置。')
const PAGE_CONTENT_GROUP = 'page_content'
const DESKTOP_FRAME_BACKGROUND_TYPE_KEY = 'desktop_frame_background_type'
const DESKTOP_FRAME_BACKGROUND_VIDEO_KEY = 'desktop_frame_background_video'
const SITE_MAINTENANCE_ENABLED_KEY = 'site_maintenance_enabled'
const SITE_MAINTENANCE_TITLE_KEY = 'site_maintenance_title'
const SITE_MAINTENANCE_MESSAGE_KEY = 'site_maintenance_message'
const SITE_MAINTENANCE_PAGE_CONTENT_KEY = 'site_maintenance_page_content'
const LANDING_NAV_ITEMS_KEY = 'landing_nav_items'
const LANDING_HERO_MEDIA_TYPE_KEY = 'landing_hero_media_type'
const LANDING_HERO_VIDEO_KEY = 'landing_hero_video'
const LANDING_HERO_POSTER_KEY = 'landing_hero_poster'
const LANDING_GALLERY_IMAGES_KEY = 'landing_gallery_images'
const LANDING_FEATURE_IMAGE_KEY = 'landing_feature_image'
const LANDING_BRAND_TITLE_KEY = 'landing_brand_title'
const LANDING_BRAND_DESCRIPTION_KEY = 'landing_brand_description'
const LANDING_BRAND_BUTTON_TEXT_KEY = 'landing_brand_button_text'
const LANDING_BRAND_BUTTON_LINK_KEY = 'landing_brand_button_link'
const LANDING_STORIES_TITLE_KEY = 'landing_stories_title'
const LANDING_STORIES_BUTTON_TEXT_KEY = 'landing_stories_button_text'
const LANDING_STORY_CARDS_KEY = 'landing_story_cards'
const LANDING_STORY_IMAGES_KEY = 'landing_story_images'
const LANDING_CLIENTS_TITLE_KEY = 'landing_clients_title'
const LANDING_CLIENTS_DESCRIPTION_KEY = 'landing_clients_description'
const LANDING_CLIENTS_LOGOS_KEY = 'landing_clients_logos'
const LANDING_TESTIMONIAL_TEXT_KEY = 'landing_testimonial_text'
const LANDING_TESTIMONIAL_NAME_KEY = 'landing_testimonial_name'
const LANDING_TESTIMONIAL_ROLE_KEY = 'landing_testimonial_role'
const LANDING_TESTIMONIAL_BRAND_KEY = 'landing_testimonial_brand'
const LANDING_CONTACT_TITLE_KEY = 'landing_contact_title'
const LANDING_CONTACT_BUTTON_TEXT_KEY = 'landing_contact_button_text'
const LANDING_CONTACT_BUTTON_LINK_KEY = 'landing_contact_button_link'
const LANDING_FOOTER_USEFUL_LINKS_KEY = 'landing_footer_useful_links'
const LANDING_FOOTER_CAPABILITIES_KEY = 'landing_footer_capabilities'
const LANDING_FOOTER_SOCIAL_LINKS_KEY = 'landing_footer_social_links'
const PROCESS_SUMMARY_NOTICE_KEY = 'process_summary_notice'
const PROCESS_REVIEW_QUESTIONS_KEY = 'process_review_questions'
const CERTIFICATE_PAGE_CONTENT_KEY = 'certificate_page_content'
const FAQ_PAGE_CONTENT_KEY = 'faq_page_content'
const FAQ_ITEMS_KEY = 'faq_items'
const WEBSITE_TERMS_KEY = 'website_terms'
const DEFAULT_PROCESS_REVIEW_QUESTIONS = JSON.stringify([
  {
    question: 'How would you evaluate this brand?',
    answers: [
      'Excellent room and great service',
      'Very comfortable and worth recommending',
      'Clean room and smooth booking experience',
      'Great location and reasonable price',
      'Overall satisfied with this product'
    ]
  }
])
const DEFAULT_PROCESS_SUMMARY_NOTICE = 'Welcome to the Process page. Please follow the task instructions carefully and complete the current step in time.'
const DEFAULT_LANDING_STORY_CARDS = JSON.stringify([
  { metric: '86%', caption: 'rise in applications', image: '' },
  { metric: '17 Million', caption: 'impressions from a KOL activation', image: '' },
  { metric: '138%', caption: 'spike in CXO engagement', image: '' },
  { metric: '3 Months', caption: 'to dominate SEO rankings', image: '' }
])
const DEFAULT_SITE_MAINTENANCE_PAGE_CONTENT = '<h1>Website Under Maintenance</h1><p>The website is currently under maintenance. Please check back later.</p>'
const DEFAULT_CERTIFICATE_PAGE_CONTENT = '<h1 style="text-align:center;">Certificates</h1>'
const DEFAULT_FAQ_PAGE_CONTENT = '<h1>Frequently Asked Questions (FAQ)</h1><hr><h2>1. How do I start a task?</h2><p>Open the Process page, review the assigned item, and submit the required answer to complete the current step.</p><hr><h2>2. Why can I not withdraw right now?</h2><p>Please confirm your account status, completed task requirements, and linked payout information. If the issue remains, contact customer support.</p><hr><h2>3. Where can I find my referral code?</h2><p>You can view your referral code in the profile drawer. Eligible members can copy and share it directly from there.</p>'
const DEFAULT_FAQ_ITEMS = JSON.stringify([
  {
    question: 'How do I start a task?',
    answer: 'Open the Process page, review the assigned item, and submit the required answer to complete the current step.'
  },
  {
    question: 'Why can I not withdraw right now?',
    answer: 'Please confirm your account status, completed task requirements, and linked payout information. If the issue remains, contact customer support.'
  },
  {
    question: 'Where can I find my referral code?',
    answer: 'You can view your referral code in the profile drawer. Eligible members can copy and share it directly from there.'
  }
])
const desktopFrameBackgroundTypeOptions = [
  { label: '关闭', value: 'none' },
  { label: '图片', value: 'image' },
  { label: '视频', value: 'video' }
]
const landingHeroMediaTypeOptions = [
  { label: '视频', value: 'video' },
  { label: '轮播图', value: 'carousel' }
]
const REQUIRED_WEBSITE_CONFIGS = [
  {
    key: 'home_banners_primary',
    value: '[]',
    type: 'images',
    group: 'website',
    group_description: '网站配置',
    description: '首页轮播图1',
    is_active: true,
    sort: 10
  },
  {
    key: 'home_banners',
    value: '[]',
    type: 'images',
    group: 'website',
    group_description: '网站配置',
    description: '首页轮播图2',
    is_active: true,
    sort: 11
  },
  {
    key: 'home_notice',
    value: 'Welcome to our official platform. Stay tuned for the latest announcements and service updates.',
    type: 'text',
    group: 'website',
    group_description: '网站配置',
    description: '首页顶部公告',
    is_active: true,
    sort: 12
  },
  {
    key: 'website_terms',
    value: '',
    type: 'text',
    group: 'website',
    group_description: '网站配置',
    description: '服务条款内容',
    is_active: true,
    sort: 13
  },
  {
    key: 'home_hero_title',
    value: 'WE TELL <span class="highlight-yellow">BRAND<br />STORIES</span> WITH<br />NUMBERS',
    type: 'text',
    group: 'website',
    group_description: '网站配置',
    description: '首页主标题',
    is_active: true,
    sort: 14
  },
  {
    key: 'home_hero_description',
    value: "The tours featured throughout our website are intended to give you ideas for what's possible when you travel with us. Treat them simply as inspiration, because your trip will be created individually by one of our specialists to match your tastes and budget.",
    type: 'text',
    group: 'website',
    group_description: '网站配置',
    description: '首页主描述',
    is_active: true,
    sort: 15
  },
  {
    key: 'home_stories_title',
    value: 'SUCCESS STORIES',
    type: 'string',
    group: 'website',
    group_description: '网站配置',
    description: '首页案例标题',
    is_active: true,
    sort: 16
  },
  {
    key: 'home_stories_button_text',
    value: 'VIEW ALL',
    type: 'string',
    group: 'website',
    group_description: '网站配置',
    description: '首页案例按钮文案',
    is_active: true,
    sort: 17
  },
  {
    key: 'home_clients_title',
    value: 'Our Clients',
    type: 'string',
    group: 'website',
    group_description: '网站配置',
    description: '首页客户标题',
    is_active: true,
    sort: 18
  },
  {
    key: 'home_clients_description',
    value: 'Maximising brand health and business outcomes for leading brands',
    type: 'string',
    group: 'website',
    group_description: '网站配置',
    description: '首页客户描述',
    is_active: true,
    sort: 19
  },
  {
    key: 'home_clients_logos',
    value: '[]',
    type: 'images',
    group: 'website',
    group_description: '网站配置',
    description: '首页客户Logo',
    is_active: true,
    sort: 20
  },
  {
    key: 'home_testimonial_text',
    value: 'It took Construct just 2 weeks to rank our keyword on the top spot; and just under3 months to get us a positive return on investment. These folks are on a different level when it comes to SEO!',
    type: 'text',
    group: 'website',
    group_description: '网站配置',
    description: '首页评价文案',
    is_active: true,
    sort: 21
  },
  {
    key: 'contact_us_title',
    value: "Let's Connect",
    type: 'string',
    group: 'website',
    group_description: '网站配置',
    description: '联系我们标题',
    is_active: true,
    sort: 22
  },
  {
    key: 'contact_us_description',
    value: 'If you have any inquiries, please contact our customer support team.',
    type: 'text',
    group: 'website',
    group_description: '网站配置',
    description: '联系我们描述',
    is_active: true,
    sort: 23
  },
  {
    key: 'contact_us_button_text',
    value: 'Contact Us',
    type: 'string',
    group: 'website',
    group_description: '网站配置',
    description: '联系我们按钮文案',
    is_active: true,
    sort: 24
  },
  {
    key: 'contact_us_head_image',
    value: '[]',
    type: 'images',
    group: 'website',
    group_description: '网站配置',
    description: '联系我们头图',
    is_active: true,
    sort: 25
  },
  {
    key: 'contact_us_icon_image',
    value: '[]',
    type: 'images',
    group: 'website',
    group_description: '网站配置',
    description: '联系我们图标',
    is_active: true,
    sort: 26
  },
  {
    key: LANDING_NAV_ITEMS_KEY,
    value: JSON.stringify([
      { label: 'Work', link: '#work' },
      { label: 'About', link: '#about' },
      { label: 'Clients', link: '#clients' },
      { label: 'Contact', link: '#contact' }
    ]),
    type: 'json',
    group: 'landing',
    group_description: '落地页配置',
    description: '顶部导航(JSON数组)',
    is_active: true,
    sort: 299
  },
  {
    key: LANDING_HERO_MEDIA_TYPE_KEY,
    value: 'video',
    type: 'string',
    group: 'landing',
    group_description: '落地页配置',
    description: '首屏资源类型',
    is_active: true,
    sort: 299.05
  },
  {
    key: LANDING_HERO_VIDEO_KEY,
    value: '',
    type: 'string',
    group: 'landing',
    group_description: '落地页配置',
    description: '首屏视频',
    is_active: true,
    sort: 299.1
  },
  {
    key: LANDING_HERO_POSTER_KEY,
    value: '[]',
    type: 'images',
    group: 'landing',
    group_description: '落地页配置',
    description: '首屏封面图',
    is_active: true,
    sort: 299.2
  },
  {
    key: LANDING_GALLERY_IMAGES_KEY,
    value: '[]',
    type: 'images',
    group: 'landing',
    group_description: '落地页配置',
    description: '首屏轮播图',
    is_active: true,
    sort: 300
  },
  {
    key: LANDING_FEATURE_IMAGE_KEY,
    value: '[]',
    type: 'images',
    group: 'landing',
    group_description: '落地页配置',
    description: '首屏主视觉图',
    is_active: true,
    sort: 301
  },
  {
    key: LANDING_BRAND_TITLE_KEY,
    value: 'WE TELL <span class="highlight-yellow">BRAND<br />STORIES</span> WITH<br />NUMBERS',
    type: 'text',
    group: 'landing',
    group_description: '落地页配置',
    description: '品牌标题',
    is_active: true,
    sort: 302
  },
  {
    key: LANDING_BRAND_DESCRIPTION_KEY,
    value: "At Construct Digital, we're not just storytellers. We're masters of numbers-driven narratives. Like you, we know that success isn't abstract. It's measured in hard metrics like leads, sales and ROI.",
    type: 'string',
    group: 'landing',
    group_description: '落地页配置',
    description: '品牌描述',
    is_active: true,
    sort: 303
  },
  {
    key: LANDING_BRAND_BUTTON_TEXT_KEY,
    value: 'LEARN MORE',
    type: 'string',
    group: 'landing',
    group_description: '落地页配置',
    description: '品牌按钮文案',
    is_active: true,
    sort: 303.1
  },
  {
    key: LANDING_BRAND_BUTTON_LINK_KEY,
    value: '/about-us',
    type: 'string',
    group: 'landing',
    group_description: '落地页配置',
    description: '品牌按钮链接',
    is_active: true,
    sort: 303.2
  },
  {
    key: LANDING_STORIES_TITLE_KEY,
    value: 'SUCCESS STORIES',
    type: 'string',
    group: 'landing',
    group_description: '落地页配置',
    description: '案例区标题',
    is_active: true,
    sort: 304
  },
  {
    key: LANDING_STORIES_BUTTON_TEXT_KEY,
    value: 'VIEW ALL',
    type: 'string',
    group: 'landing',
    group_description: '落地页配置',
    description: '案例区按钮文案',
    is_active: true,
    sort: 305
  },
  {
    key: LANDING_STORY_CARDS_KEY,
    value: DEFAULT_LANDING_STORY_CARDS,
    type: 'json',
    group: 'landing',
    group_description: '落地页配置',
    description: '案例卡片配置',
    is_active: true,
    sort: 306
  },
  {
    key: LANDING_STORY_IMAGES_KEY,
    value: '[]',
    type: 'images',
    group: 'landing',
    group_description: '落地页配置',
    description: '案例区4张图片',
    is_active: true,
    sort: 306.1
  },
  {
    key: LANDING_CLIENTS_TITLE_KEY,
    value: 'OUR CLIENTS',
    type: 'string',
    group: 'landing',
    group_description: '落地页配置',
    description: '客户区标题',
    is_active: true,
    sort: 307
  },
  {
    key: LANDING_CLIENTS_DESCRIPTION_KEY,
    value: 'Maximising brand health and business outcomes for leading brands',
    type: 'string',
    group: 'landing',
    group_description: '落地页配置',
    description: '客户区描述',
    is_active: true,
    sort: 308
  },
  {
    key: LANDING_CLIENTS_LOGOS_KEY,
    value: '[]',
    type: 'images',
    group: 'landing',
    group_description: '落地页配置',
    description: '客户区Logo',
    is_active: true,
    sort: 309
  },
  {
    key: LANDING_TESTIMONIAL_TEXT_KEY,
    value: 'It took Construct just 2 weeks to rank our keyword on the top spot; and just under 3 months to get us a positive return on investment. These folks are on a different level when it comes to SEO!',
    type: 'string',
    group: 'landing',
    group_description: '落地页配置',
    description: '口碑文案',
    is_active: true,
    sort: 310
  },
  {
    key: LANDING_TESTIMONIAL_NAME_KEY,
    value: 'Sagar Khatri,',
    type: 'string',
    group: 'landing',
    group_description: '落地页配置',
    description: '口碑姓名',
    is_active: true,
    sort: 311
  },
  {
    key: LANDING_TESTIMONIAL_ROLE_KEY,
    value: 'CEO - Multiplier HR',
    type: 'string',
    group: 'landing',
    group_description: '落地页配置',
    description: '口碑职位',
    is_active: true,
    sort: 312
  },
  {
    key: LANDING_TESTIMONIAL_BRAND_KEY,
    value: 'Multiplier',
    type: 'string',
    group: 'landing',
    group_description: '落地页配置',
    description: '口碑品牌名称',
    is_active: true,
    sort: 313
  },
  {
    key: LANDING_CONTACT_TITLE_KEY,
    value: 'Get In Touch',
    type: 'string',
    group: 'landing',
    group_description: '落地页配置',
    description: '联系区标题',
    is_active: true,
    sort: 314
  },
  {
    key: LANDING_CONTACT_BUTTON_TEXT_KEY,
    value: 'CONTACT US',
    type: 'string',
    group: 'landing',
    group_description: '落地页配置',
    description: '联系区按钮文案',
    is_active: true,
    sort: 315
  },
  {
    key: LANDING_CONTACT_BUTTON_LINK_KEY,
    value: '/contact-us',
    type: 'string',
    group: 'landing',
    group_description: '落地页配置',
    description: '联系区按钮链接',
    is_active: true,
    sort: 315.1
  },
  {
    key: LANDING_FOOTER_USEFUL_LINKS_KEY,
    value: JSON.stringify([
      { label: 'Home', link: '/' },
      { label: 'About Us', link: '/about-us' },
      { label: 'FAQs', link: '/faqs' },
      { label: 'Contact Us', link: '/contact-us' }
    ]),
    type: 'json',
    group: 'landing',
    group_description: '落地页配置',
    description: '页脚常用链接(JSON数组)',
    is_active: true,
    sort: 315.2
  },
  {
    key: LANDING_FOOTER_CAPABILITIES_KEY,
    value: JSON.stringify([
      'UX, Creative & Content',
      'Marketing, Activation & Measurement',
      'Data and Technology Enablement',
      'AI and Automation'
    ]),
    type: 'json',
    group: 'landing',
    group_description: '落地页配置',
    description: '页脚能力列表(JSON数组)',
    is_active: true,
    sort: 315.3
  },
  {
    key: LANDING_FOOTER_SOCIAL_LINKS_KEY,
    value: JSON.stringify([
      { label: 'Fb', link: '' },
      { label: 'X', link: '' },
      { label: 'Ig', link: '' },
      { label: 'In', link: '' }
    ]),
    type: 'json',
    group: 'landing',
    group_description: '落地页配置',
    description: '页脚社媒链接(JSON数组)',
    is_active: true,
    sort: 315.4
  },
  {
    key: SITE_MAINTENANCE_ENABLED_KEY,
    value: false,
    type: 'boolean',
    group: 'maintenance',
    group_description: '维护设置',
    description: '网站维护模式',
    is_active: true,
    sort: 330
  },
  {
    key: SITE_MAINTENANCE_TITLE_KEY,
    value: 'Website Under Maintenance',
    type: 'string',
    group: 'maintenance',
    group_description: '维护设置',
    description: '维护页标题',
    is_active: true,
    sort: 331
  },
  {
    key: SITE_MAINTENANCE_MESSAGE_KEY,
    value: 'The website is currently under maintenance. Please check back later.',
    type: 'text',
    group: 'maintenance',
    group_description: '维护设置',
    description: '维护页说明',
    is_active: true,
    sort: 332
  },
  {
    key: SITE_MAINTENANCE_PAGE_CONTENT_KEY,
    value: DEFAULT_SITE_MAINTENANCE_PAGE_CONTENT,
    type: 'text',
    group: 'maintenance',
    group_description: '维护设置',
    description: '维护页内容',
    is_active: true,
    sort: 333
  },
  {
    key: CERTIFICATE_PAGE_CONTENT_KEY,
    value: DEFAULT_CERTIFICATE_PAGE_CONTENT,
    type: 'text',
    group: 'website',
    group_description: '网站配置',
    description: '证书页内容',
    is_active: true,
    sort: 28
  },
  {
    key: 'certificate_title',
    value: 'Certificates',
    type: 'string',
    group: 'website',
    group_description: '网站配置',
    description: '证书页标题',
    is_active: true,
    sort: 28
  },
  {
    key: 'certificate_title_align',
    value: 'center',
    type: 'string',
    group: 'website',
    group_description: '网站配置',
    description: '证书页标题对齐方式（left/center/right）',
    is_active: true,
    sort: 29
  },
  {
    key: 'certificate_title_margin_top',
    value: '0',
    type: 'number',
    group: 'website',
    group_description: '网站配置',
    description: '证书页标题顶部间距（rem）',
    is_active: true,
    sort: 30
  },
  {
    key: 'certificate_image',
    value: '[]',
    type: 'images',
    group: 'website',
    group_description: '网站配置',
    description: '证书页图片',
    is_active: true,
    sort: 31
  },
  {
    key: DESKTOP_FRAME_BACKGROUND_TYPE_KEY,
    value: 'none',
    type: 'string',
    group: 'website',
    group_description: '网站配置',
    description: 'PC兼容模式外围背景类型（none/image/video）',
    is_active: true,
    sort: 32
  },
  {
    key: 'desktop_frame_background_image',
    value: '[]',
    type: 'images',
    group: 'website',
    group_description: '网站配置',
    description: 'PC兼容模式外围背景图',
    is_active: true,
    sort: 33
  },
  {
    key: DESKTOP_FRAME_BACKGROUND_VIDEO_KEY,
    value: '',
    type: 'string',
    group: 'website',
    group_description: '网站配置',
    description: 'PC兼容模式外围背景视频',
    is_active: true,
    sort: 34
  },
  {
    key: PROCESS_SUMMARY_NOTICE_KEY,
    value: DEFAULT_PROCESS_SUMMARY_NOTICE,
    type: 'text',
    group: 'process_review',
    group_description: '流程题库配置',
    description: '流程页顶部滚动公告',
    is_active: true,
    sort: 339
  },
  {
    key: PROCESS_REVIEW_QUESTIONS_KEY,
    value: DEFAULT_PROCESS_REVIEW_QUESTIONS,
    type: 'json',
    group: 'process_review',
    group_description: '流程题库配置',
    description: '流程页Step2题目与答案配置',
    is_active: true,
    sort: 340
  },
  {
    key: FAQ_PAGE_CONTENT_KEY,
    value: DEFAULT_FAQ_PAGE_CONTENT,
    type: 'text',
    group: 'faq',
    group_description: 'FAQ配置',
    description: 'FAQ页面内容',
    is_active: true,
    sort: 349
  },
  {
    key: FAQ_ITEMS_KEY,
    value: DEFAULT_FAQ_ITEMS,
    type: 'json',
    group: 'faq',
    group_description: 'FAQ配置',
    description: 'FAQ问题与答案配置',
    is_active: true,
    sort: 350
  }
]

// 富文本编辑器相关
const editorRef = shallowRef()
const richEditorVisible = ref(false)
const richEditorSessionKey = ref(0)
const currentEditKey = ref('')
const currentEditTitle = ref('')
const tempRichContent = ref('')

const mode = 'default'
const toolbarConfig = {
  excludeKeys: [
    'group-video',
    'fullScreen'
  ]
}
const editorConfig = {
  placeholder: '请输入内容...',
  MENU_CONF: {
    uploadImage: {
      async customUpload(file, insertFn) {
        try {
          const res = await uploadImage(file)
          if (res.data.code === 200) {
            const imageUrl = resolveSettingImageUrl(res.data.data.url)
            insertFn(imageUrl, res.data.data.url, imageUrl)
          } else {
            message.error('图片上传失败')
          }
        } catch (error) {
          message.error('图片上传失败')
        }
      }
    }
  }
}

const getConfigsByGroup = (group) => {
  return configData.value
    .filter(config => config.group === group && config.is_active)
    .sort((a, b) => (a.sort) - (b.sort))
}

const ensureRequiredWebsiteConfigs = configs => {
  const normalizedConfigs = [...configs]

  REQUIRED_WEBSITE_CONFIGS.forEach(requiredConfig => {
    const existingConfig = normalizedConfigs.find(config => config.key === requiredConfig.key)

    if (existingConfig) {
      Object.assign(existingConfig, {
        ...existingConfig,
        type: requiredConfig.type,
        group: requiredConfig.group,
        group_description: requiredConfig.group_description,
        description: requiredConfig.description,
        is_active: true,
        sort: requiredConfig.sort
      })
      return
    }

    normalizedConfigs.push({ ...requiredConfig })
  })

  return normalizedConfigs
}

const getConfigByKey = (key) => {
  return configData.value.find(config => config.key === key && config.is_active)
}

const eventRuleCards = computed(() => {
  return Array.from({ length: 4 }, (_, index) => {
    const slot = index + 1
    return {
      id: slot,
      configs: [
        getConfigByKey(`event_recharge_cashback_${slot}_type`),
        getConfigByKey(`event_recharge_cashback_${slot}_deposit`),
        getConfigByKey(`event_recharge_cashback_${slot}_bonus`)
      ].filter(Boolean)
    }
  }).filter(card => card.configs.length > 0)
})

const eventConditionConfigs = computed(() => {
  return Array.from({ length: 4 }, (_, index) =>
    getConfigByKey(`event_recharge_cashback_condition_${index + 1}`)
  ).filter(Boolean)
})

const websiteGeneralConfigs = computed(() => {
  return getConfigsByGroup('website').filter(config => {
    return !isProcessReviewQuestionsConfig(config.key) && !isCertificateLegacyConfig(config.key) && !isPageContentConfig(config.key)
  })
})

const checkinRewardCards = computed(() => {
  return Array.from({ length: 2 }, (_, index) => {
    const slot = index + 1
    return {
      id: slot,
      configs: [
        getConfigByKey(`checkin_reward_${slot}_day`),
        getConfigByKey(`checkin_reward_${slot}_amount`)
      ].filter(Boolean)
    }
  }).filter(card => card.configs.length > 0)
})

const checkinNoticeConfig = computed(() => getConfigByKey('checkin_notice'))
const partnerRankingConfig = computed(() => getConfigByKey('partner_rankings'))
const landingNavItemsConfig = computed(() => getConfigByKey(LANDING_NAV_ITEMS_KEY))
const landingHeroMediaTypeConfig = computed(() => getConfigByKey(LANDING_HERO_MEDIA_TYPE_KEY))
const landingHeroVideoConfig = computed(() => getConfigByKey(LANDING_HERO_VIDEO_KEY))
const landingHeroPosterConfig = computed(() => getConfigByKey(LANDING_HERO_POSTER_KEY))
const landingGalleryImagesConfig = computed(() => getConfigByKey(LANDING_GALLERY_IMAGES_KEY))
const landingFeatureImageConfig = computed(() => getConfigByKey(LANDING_FEATURE_IMAGE_KEY))
const landingBrandTitleConfig = computed(() => getConfigByKey(LANDING_BRAND_TITLE_KEY))
const landingBrandDescriptionConfig = computed(() => getConfigByKey(LANDING_BRAND_DESCRIPTION_KEY))
const landingBrandButtonTextConfig = computed(() => getConfigByKey(LANDING_BRAND_BUTTON_TEXT_KEY))
const landingBrandButtonLinkConfig = computed(() => getConfigByKey(LANDING_BRAND_BUTTON_LINK_KEY))
const landingStoriesTitleConfig = computed(() => getConfigByKey(LANDING_STORIES_TITLE_KEY))
const landingStoriesButtonTextConfig = computed(() => getConfigByKey(LANDING_STORIES_BUTTON_TEXT_KEY))
const landingStoryCardsConfig = computed(() => getConfigByKey(LANDING_STORY_CARDS_KEY))
const landingStoryImagesConfig = computed(() => getConfigByKey(LANDING_STORY_IMAGES_KEY))
const landingClientsTitleConfig = computed(() => getConfigByKey(LANDING_CLIENTS_TITLE_KEY))
const landingClientsDescriptionConfig = computed(() => getConfigByKey(LANDING_CLIENTS_DESCRIPTION_KEY))
const landingClientsLogosConfig = computed(() => getConfigByKey(LANDING_CLIENTS_LOGOS_KEY))
const landingTestimonialTextConfig = computed(() => getConfigByKey(LANDING_TESTIMONIAL_TEXT_KEY))
const landingTestimonialNameConfig = computed(() => getConfigByKey(LANDING_TESTIMONIAL_NAME_KEY))
const landingTestimonialRoleConfig = computed(() => getConfigByKey(LANDING_TESTIMONIAL_ROLE_KEY))
const landingTestimonialBrandConfig = computed(() => getConfigByKey(LANDING_TESTIMONIAL_BRAND_KEY))
const landingContactTitleConfig = computed(() => getConfigByKey(LANDING_CONTACT_TITLE_KEY))
const landingContactButtonTextConfig = computed(() => getConfigByKey(LANDING_CONTACT_BUTTON_TEXT_KEY))
const landingContactButtonLinkConfig = computed(() => getConfigByKey(LANDING_CONTACT_BUTTON_LINK_KEY))
const landingFooterUsefulLinksConfig = computed(() => getConfigByKey(LANDING_FOOTER_USEFUL_LINKS_KEY))
const landingFooterCapabilitiesConfig = computed(() => getConfigByKey(LANDING_FOOTER_CAPABILITIES_KEY))
const landingFooterSocialLinksConfig = computed(() => getConfigByKey(LANDING_FOOTER_SOCIAL_LINKS_KEY))
const processNoticeConfig = computed(() => getConfigByKey(PROCESS_SUMMARY_NOTICE_KEY))
const processReviewQuestionConfig = computed(() => getConfigByKey(PROCESS_REVIEW_QUESTIONS_KEY))
const faqConfig = computed(() => getConfigByKey(FAQ_PAGE_CONTENT_KEY))
const maintenanceEnabledConfig = computed(() => getConfigByKey(SITE_MAINTENANCE_ENABLED_KEY))
const maintenancePageContentConfig = computed(() => getConfigByKey(SITE_MAINTENANCE_PAGE_CONTENT_KEY))
const landingContentSections = computed(() => ([
  {
    id: 'hero',
    title: '首屏展示',
    description: '配置首屏拼贴背景图和主视觉设备图。',
    configs: [landingGalleryImagesConfig.value, landingFeatureImageConfig.value].filter(Boolean)
  },
  {
    id: 'brand',
    title: '品牌介绍',
    description: '配置蓝色品牌文案区的标题与描述。',
    configs: [
      landingBrandTitleConfig.value,
      landingBrandDescriptionConfig.value,
      landingBrandButtonTextConfig.value,
      landingBrandButtonLinkConfig.value
    ].filter(Boolean)
  },
  {
    id: 'clients',
    title: '客户展示',
    description: '配置客户标题、描述和 Logo 列表。',
    configs: [landingClientsTitleConfig.value, landingClientsDescriptionConfig.value, landingClientsLogosConfig.value].filter(Boolean)
  },
  {
    id: 'testimonial',
    title: '口碑区',
    description: '配置口碑文案、姓名、职位和品牌名称。',
    configs: [
      landingTestimonialTextConfig.value,
      landingTestimonialNameConfig.value,
      landingTestimonialRoleConfig.value,
      landingTestimonialBrandConfig.value
    ].filter(Boolean)
  },
  {
    id: 'contact',
    title: '联系区',
    description: '配置黄色 CTA 区块的标题和按钮文案。',
    configs: [
      landingContactTitleConfig.value,
      landingContactButtonTextConfig.value,
      landingContactButtonLinkConfig.value
    ].filter(Boolean)
  }
]).filter(section => section.configs.length > 0))
const fullPageEditorConfigs = computed(() => {
  const configTips = {
    [WEBSITE_TERMS_KEY]: '适合编辑 Terms Conditions 这类纯内容页面，支持整页文字、图片和分隔线布局。',
    [CERTIFICATE_PAGE_CONTENT_KEY]: '适合编辑 Certificates 这类纯内容页面，支持直接插入标题、图片和附加说明。',
    [FAQ_PAGE_CONTENT_KEY]: '适合编辑 FAQ 这类纯内容页面，问题编号、字号和分隔线都在同一份页面内容里统一控制。'
  }

  return [
    getConfigByKey(WEBSITE_TERMS_KEY),
    getConfigByKey(CERTIFICATE_PAGE_CONTENT_KEY),
    getConfigByKey(FAQ_PAGE_CONTENT_KEY)
  ]
    .filter(Boolean)
    .map(config => ({
      ...config,
      pageTip: configTips[config.key] || ''
    }))
})
const aboutConfigSections = computed(() => ([
  {
    id: 'hero',
    title: 'Hero 区',
    description: '配置 About Us 页最上方的大标题。',
    singleColumn: true,
    configs: [
      getConfigByKey('about_hero_title')
    ].filter(Boolean)
  },
  {
    id: 'brand',
    title: '品牌故事',
    description: '配置品牌故事区的标题、正文和按钮跳转。',
    singleColumn: false,
    configs: [
      getConfigByKey('about_brand_title'),
      getConfigByKey('about_brand_button_text'),
      getConfigByKey('about_brand_button_link'),
      getConfigByKey('about_brand_content')
    ].filter(Boolean)
  },
  {
    id: 'approach',
    title: '方法论',
    description: '配置蓝色区块的标题和正文内容。',
    singleColumn: true,
    configs: [
      getConfigByKey('about_approach_title'),
      getConfigByKey('about_approach_content')
    ].filter(Boolean)
  },
  {
    id: 'people',
    title: '团队介绍',
    description: '配置 Our People 区块的文案和按钮。',
    singleColumn: false,
    configs: [
      getConfigByKey('about_people_title'),
      getConfigByKey('about_people_button_text'),
      getConfigByKey('about_people_button_link'),
      getConfigByKey('about_people_content')
    ].filter(Boolean)
  },
  {
    id: 'awards',
    title: '奖项区',
    description: '配置奖项数字、文案和轮播图片。',
    singleColumn: false,
    configs: [
      getConfigByKey('about_awards_count'),
      getConfigByKey('about_awards_title'),
      getConfigByKey('about_awards_content'),
      getConfigByKey('about_awards_images')
    ].filter(Boolean)
  },
  {
    id: 'join',
    title: '加入我们',
    description: '配置页面底部 CTA 标题和按钮。',
    singleColumn: false,
    configs: [
      getConfigByKey('about_join_title'),
      getConfigByKey('about_join_button_text'),
      getConfigByKey('about_join_button_link')
    ].filter(Boolean)
  }
]).filter(section => section.configs.length > 0))

const getGroupName = (group) => {
  if (group === PAGE_CONTENT_GROUP) {
    return '整页编辑页面'
  }

  const config = configData.value.find(c => c.group === group)
  return config?.group_description
}

const isDesktopFrameBackgroundTypeConfig = key => key === DESKTOP_FRAME_BACKGROUND_TYPE_KEY
const isVideoUploadConfig = key => key === DESKTOP_FRAME_BACKGROUND_VIDEO_KEY
const isProcessReviewQuestionsConfig = key => key === PROCESS_REVIEW_QUESTIONS_KEY
const isPageContentConfig = key => [WEBSITE_TERMS_KEY, CERTIFICATE_PAGE_CONTENT_KEY, FAQ_PAGE_CONTENT_KEY].includes(key)
const isCertificateLegacyConfig = key => [
  'certificate_title',
  'certificate_title_align',
  'certificate_title_margin_top',
  'certificate_image'
].includes(key)
const processReviewQuestionStats = computed(() => ({
  questionCount: processReviewQuestions.value.length,
  answerCount: processReviewQuestions.value.reduce((total, item) => total + (Array.isArray(item.answers) ? item.answers.length : 0), 0)
}))
const paginatedProcessReviewQuestions = computed(() => {
  const startIndex = (processReviewCurrentPage.value - 1) * processReviewPageSize.value
  return processReviewQuestions.value
    .slice(startIndex, startIndex + processReviewPageSize.value)
    .map((item, offset) => ({
      item,
      index: startIndex + offset
    }))
})

const createEditorUid = prefix => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`

const createProcessReviewAnswer = (text = '') => ({
  uid: createEditorUid('process-review-answer'),
  text: String(text ?? '')
})

const createProcessReviewQuestion = (question = '', answers = ['']) => {
  const normalizedAnswers = Array.isArray(answers) && answers.length ? answers : ['']

  return {
    uid: createEditorUid('process-review-question'),
    question: String(question ?? ''),
    answers: normalizedAnswers.map(answer => createProcessReviewAnswer(answer))
  }
}

const createFaqItem = (question = '', answer = '') => ({
  uid: createEditorUid('faq-item'),
  question: String(question ?? ''),
  answer: String(answer ?? '')
})

const createLandingLinkItem = (label = '', link = '') => ({
  uid: createEditorUid('landing-link-item'),
  label: String(label ?? '').trim(),
  link: String(link ?? '').trim()
})

const createLandingTextItem = (text = '') => ({
  uid: createEditorUid('landing-text-item'),
  text: String(text ?? '').trim()
})

const isProcessReviewQuestionExpanded = uid => expandedProcessReviewQuestionUids.value.includes(uid)

const toggleProcessReviewQuestionExpanded = uid => {
  if (isProcessReviewQuestionExpanded(uid)) {
    expandedProcessReviewQuestionUids.value = expandedProcessReviewQuestionUids.value.filter(item => item !== uid)
    return
  }

  expandedProcessReviewQuestionUids.value = [...expandedProcessReviewQuestionUids.value, uid]
}

const collapseAllProcessReviewQuestions = () => {
  expandedProcessReviewQuestionUids.value = []
}

const expandAllProcessReviewQuestions = () => {
  expandedProcessReviewQuestionUids.value = processReviewQuestions.value.map(item => item.uid)
}

const normalizeProcessReviewQuestionPage = () => {
  const totalPages = Math.max(1, Math.ceil(processReviewQuestions.value.length / processReviewPageSize.value))
  if (processReviewCurrentPage.value > totalPages) {
    processReviewCurrentPage.value = totalPages
  }

  if (processReviewCurrentPage.value < 1) {
    processReviewCurrentPage.value = 1
  }
}

const jumpToProcessReviewQuestion = index => {
  if (index < 0) {
    processReviewCurrentPage.value = 1
    return
  }

  processReviewCurrentPage.value = Math.floor(index / processReviewPageSize.value) + 1
}

const openProcessReviewImportModal = () => {
  processReviewImportVisible.value = true
}

const closeProcessReviewImportModal = () => {
  processReviewImportVisible.value = false
  processReviewImportText.value = ''
  processReviewImportMode.value = 'append'
}

const parseProcessReviewImportText = rawText => {
  const lines = String(rawText || '')
    .replace(/\r/g, '')
    .split('\n')

  const questions = []
  let currentQuestion = null
  let currentAnswer = null

  const pushCurrentQuestion = () => {
    if (!currentQuestion) {
      return
    }

    const normalizedQuestion = String(currentQuestion.question || '').trim()
    const normalizedAnswers = (currentQuestion.answers || [])
      .map(answer => String(answer || '').trim())
      .filter(Boolean)

    if (normalizedQuestion && normalizedAnswers.length) {
      questions.push(createProcessReviewQuestion(normalizedQuestion, normalizedAnswers))
    }
  }

  lines.forEach(rawLine => {
    const line = rawLine.trim()
    if (!line) {
      return
    }

    const questionMatch = line.match(/^Q\s*\d+\.\s*(.+)$/i)
    if (questionMatch) {
      pushCurrentQuestion()
      currentQuestion = {
        question: questionMatch[1].trim(),
        answers: []
      }
      currentAnswer = null
      return
    }

    const answerMatch = line.match(/^[A-Z]\.\s*(.+)$/i)
    if (answerMatch && currentQuestion) {
      const answerText = answerMatch[1].trim()
      currentQuestion.answers.push(answerText)
      currentAnswer = currentQuestion.answers.length - 1
      return
    }

    if (currentQuestion && currentAnswer !== null) {
      currentQuestion.answers[currentAnswer] = `${currentQuestion.answers[currentAnswer]} ${line}`.trim()
      return
    }

    if (currentQuestion) {
      currentQuestion.question = `${currentQuestion.question} ${line}`.trim()
    }
  })

  pushCurrentQuestion()
  return questions
}

const applyProcessReviewImport = () => {
  const importedQuestions = parseProcessReviewImportText(processReviewImportText.value)

  if (!importedQuestions.length) {
    message.error('未识别到有效题目，请检查导入格式')
    return
  }

  processReviewQuestions.value = processReviewImportMode.value === 'replace'
    ? importedQuestions
    : [...processReviewQuestions.value, ...importedQuestions]

  syncProcessReviewQuestions()
  normalizeProcessReviewQuestionPage()
  jumpToProcessReviewQuestion(
    processReviewImportMode.value === 'replace'
      ? 0
      : Math.max(processReviewQuestions.value.length - importedQuestions.length, 0)
  )

  message.success(`成功导入 ${importedQuestions.length} 道题目`)
  closeProcessReviewImportModal()
}

const parseFaqItems = value => {
  if (!value) {
    return []
  }

  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .filter(item => item && typeof item === 'object')
      .map(item => createFaqItem(item.question, item.answer))
  } catch {
    return []
  }
}

const normalizeFaqItems = () => {
  return faqItems.value.map(item => ({
    question: String(item.question || '').trim(),
    answer: String(item.answer || '').trim()
  }))
}

const buildFaqPageContentFromItems = items => {
  const normalizedItems = (items || [])
    .map(item => ({
      question: String(item?.question || '').trim(),
      answer: String(item?.answer || '').trim()
    }))
    .filter(item => item.question && item.answer)

  if (!normalizedItems.length) {
    return DEFAULT_FAQ_PAGE_CONTENT
  }

  return normalizedItems.map((item, index) => {
    const title = `<h2>${index + 1}. ${item.question}</h2>`
    const answer = /<[a-z][\s\S]*>/i.test(item.answer)
      ? item.answer
      : item.answer
        .split(/\n{2,}/)
        .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
        .join('')

    return `${index === 0 ? '<h1>Frequently Asked Questions (FAQ)</h1><hr>' : '<hr>'}${title}${answer}`
  }).join('')
}

const buildMaintenancePageContentFromLegacy = () => {
  const currentContent = String(formState[SITE_MAINTENANCE_PAGE_CONTENT_KEY] || '').trim()
  if (currentContent) {
    return currentContent
  }

  const title = String(formState[SITE_MAINTENANCE_TITLE_KEY] || '').trim() || 'Website Under Maintenance'
  const message = String(formState[SITE_MAINTENANCE_MESSAGE_KEY] || '').trim() || 'The website is currently under maintenance. Please check back later.'
  const messageHtml = /<[a-z][\s\S]*>/i.test(message)
    ? message
    : message
      .split(/\n{2,}/)
      .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
      .join('')

  return `<h1>${title}</h1>${messageHtml}`
}

const ensureMaintenancePageContentValue = () => {
  if (String(formState[SITE_MAINTENANCE_PAGE_CONTENT_KEY] || '').trim()) {
    return
  }

  formState[SITE_MAINTENANCE_PAGE_CONTENT_KEY] = buildMaintenancePageContentFromLegacy() || DEFAULT_SITE_MAINTENANCE_PAGE_CONTENT
}

const buildCertificatePageContentFromLegacy = () => {
  const currentContent = String(formState[CERTIFICATE_PAGE_CONTENT_KEY] || '').trim()
  if (currentContent) {
    return currentContent
  }

  const title = String(formState.certificate_title || '').trim() || 'Certificates'
  const titleAlign = ['left', 'center', 'right'].includes(String(formState.certificate_title_align || '').trim())
    ? String(formState.certificate_title_align || '').trim()
    : 'center'
  const image = parseImageConfigValue(formState.certificate_image).find(Boolean)

  const sections = [`<h1 style="text-align:${titleAlign};">${title}</h1>`]
  if (image) {
    sections.push(`<p><img src="${image}" alt="${title}" /></p>`)
  }

  return sections.join('')
}

const ensureCertificatePageContentValue = () => {
  if (String(formState[CERTIFICATE_PAGE_CONTENT_KEY] || '').trim()) {
    return
  }

  formState[CERTIFICATE_PAGE_CONTENT_KEY] = buildCertificatePageContentFromLegacy() || DEFAULT_CERTIFICATE_PAGE_CONTENT
}

const ensureFaqPageContentValue = () => {
  const currentContent = String(formState[FAQ_PAGE_CONTENT_KEY] || '').trim()
  if (currentContent) {
    return
  }

  const migratedContent = buildFaqPageContentFromItems(parseFaqItems(formState[FAQ_ITEMS_KEY]))
  formState[FAQ_PAGE_CONTENT_KEY] = migratedContent
}

const syncFaqItems = () => {
  formState[FAQ_ITEMS_KEY] = JSON.stringify(normalizeFaqItems())
}

const parseLandingLinkItems = value => {
  if (!value) {
    return []
  }

  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .filter(item => item && typeof item === 'object')
      .map(item => createLandingLinkItem(item.label, item.link))
  } catch {
    return []
  }
}

const normalizeLandingLinkItems = items => {
  return items.map(item => ({
    label: String(item.label || '').trim(),
    link: String(item.link || '').trim()
  }))
}

const syncLandingNavItems = () => {
  formState[LANDING_NAV_ITEMS_KEY] = JSON.stringify(normalizeLandingLinkItems(landingNavItems.value))
}

const syncLandingFooterUsefulLinks = () => {
  formState[LANDING_FOOTER_USEFUL_LINKS_KEY] = JSON.stringify(normalizeLandingLinkItems(landingFooterUsefulLinks.value))
}

const syncLandingFooterSocialLinks = () => {
  formState[LANDING_FOOTER_SOCIAL_LINKS_KEY] = JSON.stringify(normalizeLandingLinkItems(landingFooterSocialLinks.value))
}

const addLandingNavItem = () => {
  landingNavItems.value.push(createLandingLinkItem())
  syncLandingNavItems()
}

const removeLandingNavItem = index => {
  landingNavItems.value.splice(index, 1)
  syncLandingNavItems()
}

const moveLandingNavItem = (index, step) => {
  const targetIndex = index + step
  if (targetIndex < 0 || targetIndex >= landingNavItems.value.length) {
    return
  }

  const [currentItem] = landingNavItems.value.splice(index, 1)
  landingNavItems.value.splice(targetIndex, 0, currentItem)
  syncLandingNavItems()
}

const addLandingFooterUsefulLink = () => {
  landingFooterUsefulLinks.value.push(createLandingLinkItem())
  syncLandingFooterUsefulLinks()
}

const removeLandingFooterUsefulLink = index => {
  landingFooterUsefulLinks.value.splice(index, 1)
  syncLandingFooterUsefulLinks()
}

const moveLandingFooterUsefulLink = (index, step) => {
  const targetIndex = index + step
  if (targetIndex < 0 || targetIndex >= landingFooterUsefulLinks.value.length) {
    return
  }

  const [currentItem] = landingFooterUsefulLinks.value.splice(index, 1)
  landingFooterUsefulLinks.value.splice(targetIndex, 0, currentItem)
  syncLandingFooterUsefulLinks()
}

const parseLandingTextItems = value => {
  if (!value) {
    return []
  }

  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.map(item => {
      if (item && typeof item === 'object') {
        return createLandingTextItem(item.text ?? item.label ?? '')
      }

      return createLandingTextItem(item)
    })
  } catch {
    return []
  }
}

const normalizeLandingTextItems = items => {
  return items.map(item => String(item.text || '').trim())
}

const syncLandingFooterCapabilities = () => {
  formState[LANDING_FOOTER_CAPABILITIES_KEY] = JSON.stringify(normalizeLandingTextItems(landingFooterCapabilities.value))
}

const addLandingFooterCapability = () => {
  landingFooterCapabilities.value.push(createLandingTextItem())
  syncLandingFooterCapabilities()
}

const removeLandingFooterCapability = index => {
  landingFooterCapabilities.value.splice(index, 1)
  syncLandingFooterCapabilities()
}

const moveLandingFooterCapability = (index, step) => {
  const targetIndex = index + step
  if (targetIndex < 0 || targetIndex >= landingFooterCapabilities.value.length) {
    return
  }

  const [currentItem] = landingFooterCapabilities.value.splice(index, 1)
  landingFooterCapabilities.value.splice(targetIndex, 0, currentItem)
  syncLandingFooterCapabilities()
}

const addLandingFooterSocialLink = () => {
  landingFooterSocialLinks.value.push(createLandingLinkItem())
  syncLandingFooterSocialLinks()
}

const removeLandingFooterSocialLink = index => {
  landingFooterSocialLinks.value.splice(index, 1)
  syncLandingFooterSocialLinks()
}

const moveLandingFooterSocialLink = (index, step) => {
  const targetIndex = index + step
  if (targetIndex < 0 || targetIndex >= landingFooterSocialLinks.value.length) {
    return
  }

  const [currentItem] = landingFooterSocialLinks.value.splice(index, 1)
  landingFooterSocialLinks.value.splice(targetIndex, 0, currentItem)
  syncLandingFooterSocialLinks()
}

const createLandingStoryCard = (metric = '', caption = '', image = '') => ({
  uid: createEditorUid('landing-story-card'),
  metric: String(metric || '').trim(),
  caption: String(caption || '').trim(),
  image: String(image || '').trim()
})

const parseLandingStoryCards = value => {
  if (!value) {
    return []
  }

  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .filter(item => item && typeof item === 'object')
      .map(item => createLandingStoryCard(item.metric, item.caption, item.image))
  } catch {
    return []
  }
}

const normalizeLandingStoryCards = () => {
  return landingStoryCards.value.map(item => ({
    metric: String(item.metric || '').trim(),
    caption: String(item.caption || '').trim(),
    image: String(item.image || '').trim()
  }))
}

const syncLandingStoryCards = () => {
  formState[LANDING_STORY_CARDS_KEY] = JSON.stringify(normalizeLandingStoryCards())
}

const addLandingStoryCard = () => {
  landingStoryCards.value.push(createLandingStoryCard())
  syncLandingStoryCards()
}

const removeLandingStoryCard = index => {
  landingStoryCards.value.splice(index, 1)
  syncLandingStoryCards()
}

const moveLandingStoryCard = (index, step) => {
  const targetIndex = index + step

  if (targetIndex < 0 || targetIndex >= landingStoryCards.value.length) {
    return
  }

  const [currentItem] = landingStoryCards.value.splice(index, 1)
  landingStoryCards.value.splice(targetIndex, 0, currentItem)
  syncLandingStoryCards()
}

const getLandingStoryCardFileList = item => {
  if (!item?.image) {
    return []
  }

  return [{
    uid: item.uid,
    name: 'story-card-image',
    status: 'done',
    url: resolveSettingImageUrl(item.image)
  }]
}

const handleLandingStoryCardImageUpload = async (item, { file, onSuccess, onError }) => {
  try {
    const res = await uploadImage(file)
    const uploadResult = res?.data ?? res

    if (uploadResult?.code !== 200 || !uploadResult?.data?.url) {
      throw new Error(uploadResult?.message || '图片上传失败')
    }

    item.image = uploadResult.data.url
    syncLandingStoryCards()
    onSuccess(uploadResult.data)
    message.success('图片上传成功')
  } catch (error) {
    message.error(error?.message || '图片上传失败')
    onError(error)
  }
}

const parseProcessReviewQuestions = value => {
  if (!value) {
    return []
  }

  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .filter(item => item && typeof item === 'object')
      .map(item => createProcessReviewQuestion(item.question, Array.isArray(item.answers) ? item.answers : []))
  } catch {
    return []
  }
}

const normalizeProcessReviewQuestions = () => {
  return processReviewQuestions.value.map(item => ({
    question: String(item.question || '').trim(),
    answers: (item.answers || [])
      .map(answer => String(answer?.text || '').trim())
      .filter(Boolean)
  }))
}

const syncProcessReviewQuestions = () => {
  formState[PROCESS_REVIEW_QUESTIONS_KEY] = JSON.stringify(normalizeProcessReviewQuestions())
}

const addProcessReviewQuestion = () => {
  processReviewQuestions.value.push(createProcessReviewQuestion())
  syncProcessReviewQuestions()
  jumpToProcessReviewQuestion(processReviewQuestions.value.length - 1)
}

const moveProcessReviewQuestion = (index, step) => {
  const targetIndex = index + step

  if (targetIndex < 0 || targetIndex >= processReviewQuestions.value.length) {
    return
  }

  const [currentItem] = processReviewQuestions.value.splice(index, 1)
  processReviewQuestions.value.splice(targetIndex, 0, currentItem)
  syncProcessReviewQuestions()
  jumpToProcessReviewQuestion(targetIndex)
}

const duplicateProcessReviewQuestion = index => {
  const questionItem = processReviewQuestions.value[index]
  if (!questionItem) {
    return
  }

  processReviewQuestions.value.splice(
    index + 1,
    0,
    createProcessReviewQuestion(
      questionItem.question,
      (questionItem.answers || []).map(answer => answer?.text || '')
    )
  )
  syncProcessReviewQuestions()
  jumpToProcessReviewQuestion(index + 1)
}

const removeProcessReviewQuestion = index => {
  processReviewQuestions.value.splice(index, 1)
  syncProcessReviewQuestions()
  normalizeProcessReviewQuestionPage()
}

const addProcessReviewAnswer = questionIndex => {
  processReviewQuestions.value[questionIndex]?.answers.push(createProcessReviewAnswer())
  syncProcessReviewQuestions()
}

const removeProcessReviewAnswer = (questionIndex, answerIndex) => {
  const questionItem = processReviewQuestions.value[questionIndex]
  if (!questionItem) {
    return
  }

  questionItem.answers.splice(answerIndex, 1)

  if (!questionItem.answers.length) {
    questionItem.answers.push(createProcessReviewAnswer())
  }

  syncProcessReviewQuestions()
}

const moveProcessReviewAnswer = (questionIndex, answerIndex, step) => {
  const questionItem = processReviewQuestions.value[questionIndex]
  if (!questionItem) {
    return
  }

  const targetIndex = answerIndex + step
  if (targetIndex < 0 || targetIndex >= questionItem.answers.length) {
    return
  }

  const [currentItem] = questionItem.answers.splice(answerIndex, 1)
  questionItem.answers.splice(targetIndex, 0, currentItem)
  syncProcessReviewQuestions()
}

const isTimeConfig = (key) => {
  return key.includes('time') && (key.includes('start') || key.includes('end'))
}

const getNumberStep = (key) => {
  return key.includes('fee') || key.includes('reward') || key.includes('rate') || key.includes('percent')
    ? (key.includes('percent') ? 1 : 0.01)
    : (key.includes('margin_top') ? 0.1 : 1)
}

const getNumberPrecision = (key) => {
  return key.includes('fee') || key.includes('reward') || key.includes('rate')
    ? 2
    : (key.includes('percent') ? 0 : (key.includes('margin_top') ? 1 : 0))
}

const getNumberUnit = (key) => {
  if (key.includes('fee') || key.includes('reward') || key.includes('rate') || key.includes('percent')) {
    return '%'
  }

  if (key.includes('margin_top')) {
    return 'rem'
  }

  return null
}

const resolveSettingImageUrl = value => {
  if (!value) {
    return ''
  }

  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value
  }

  const baseUrl = import.meta.env.VITE_API_URL || ''
  if (!baseUrl) {
    return value
  }

  const origin = baseUrl.replace(/\/admin\/?$/, '').replace(/\/$/, '')
  return value.startsWith('/') ? `${origin}${value}` : `${origin}/${value}`
}

const toStoredImagePath = value => {
  if (!value) {
    return ''
  }

  const normalizedValue = String(value).trim()
  const baseUrl = import.meta.env.VITE_API_URL || ''

  if (!baseUrl) {
    return normalizedValue
  }

  const origin = baseUrl.replace(/\/admin\/?$/, '').replace(/\/$/, '')
  return normalizedValue.startsWith(origin) ? normalizedValue.slice(origin.length) || '/' : normalizedValue
}

const normalizeRichContentImageUrls = (htmlContent, transformUrl) => {
  const normalizedHtml = String(htmlContent || '').trim()
  if (!normalizedHtml || !/<img[\s\S]*?>/i.test(normalizedHtml)) {
    return normalizedHtml
  }

  if (typeof document === 'undefined') {
    return normalizedHtml
  }

  const container = document.createElement('div')
  container.innerHTML = normalizedHtml

  container.querySelectorAll('img').forEach(image => {
    const src = image.getAttribute('src')
    if (!src) {
      return
    }

    image.setAttribute('src', transformUrl(src))
  })

  return container.innerHTML
}

const normalizeRichContentForEditor = htmlContent => {
  return normalizeRichContentImageUrls(htmlContent, src => {
    if (
      /^(https?:)?\/\//i.test(src)
      || src.startsWith('data:')
      || src.startsWith('blob:')
      || src.startsWith('/assets/')
      || src.startsWith('assets/')
    ) {
      return src
    }

    return resolveSettingImageUrl(src)
  })
}

const normalizeRichContentForStorage = htmlContent => {
  return normalizeRichContentImageUrls(htmlContent, src => {
    if (
      src.startsWith('data:')
      || src.startsWith('blob:')
      || src.startsWith('/assets/')
      || src.startsWith('assets/')
    ) {
      return src
    }

    return toStoredImagePath(src)
  })
}

const destroyRichEditor = () => {
  const editor = editorRef.value
  if (editor == null) {
    return
  }

  editor.destroy()
  editorRef.value = null
}

const parseImageConfigValue = value => {
  if (!value) {
    return []
  }

  if (Array.isArray(value)) {
    return value.map(item => String(item || '').trim()).filter(Boolean)
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) {
        return parsed.map(item => String(item || '').trim()).filter(Boolean)
      }
    } catch {
      return value.split(',').map(item => item.trim()).filter(Boolean)
    }
  }

  return []
}

const createImageFileList = urls => {
  return urls.map((url, index) => ({
    uid: `image-${index}-${url}`,
    name: `image-${index}`,
    status: 'done',
    url: resolveSettingImageUrl(url),
    settingUrl: url,
    response: { url }
  }))
}

const extractImageUrls = fileList => {
  return (fileList || []).map(file => {
    if (file.settingUrl) {
      return toStoredImagePath(file.settingUrl)
    }

    if (file.response?.url) {
      return toStoredImagePath(file.response.url)
    }

    if (file.response?.data?.url) {
      return toStoredImagePath(file.response.data.url)
    }

    if (typeof file.response === 'string') {
      return toStoredImagePath(file.response)
    }

    if (file.url) {
      return toStoredImagePath(file.url)
    }

    return ''
  }).filter(Boolean)
}

const syncImageConfig = (configKey, fileList = []) => {
  const normalizedFileList = fileList.map(file => {
    const storedUrl = file.settingUrl
      || file.response?.url
      || file.response?.data?.url
      || (typeof file.response === 'string' ? file.response : '')
      || file.url
      || ''

    return {
      ...file,
      settingUrl: toStoredImagePath(storedUrl),
      url: file.url || resolveSettingImageUrl(storedUrl),
      response: file.response || (storedUrl ? { url: toStoredImagePath(storedUrl) } : undefined)
    }
  })

  imageFiles[configKey] = normalizedFileList
  formState[configKey] = JSON.stringify(extractImageUrls(normalizedFileList))
}

const handleUpload = async (configKey, { file, onSuccess, onError }) => {
  try {
    const res = await uploadImage(file)
    const uploadResult = res?.data ?? res

    if (uploadResult?.code === 200) {
      onSuccess(uploadResult.data)
    } else {
      onError(new Error(uploadResult?.message || '上传失败'))
    }
  } catch (error) {
    onError(error)
  }
}

const handleImageChange = (configKey, { fileList }) => {
  syncImageConfig(configKey, fileList)
}

const handleMediaUpload = async (configKey, { file, onSuccess, onError }) => {
  try {
    const res = await uploadMedia(file)
    const uploadResult = res?.data ?? res

    if (uploadResult?.code !== 200 || !uploadResult?.data?.url) {
      throw new Error(uploadResult?.message || '上传失败')
    }

    formState[configKey] = toStoredImagePath(uploadResult.data.url)
    onSuccess(uploadResult.data)
    message.success('视频上传成功')
  } catch (error) {
    message.error(error?.message || '视频上传失败')
    onError(error)
  }
}

const clearMediaConfig = configKey => {
  formState[configKey] = ''
}

const parsePartnerRankings = value => {
  if (!value) {
    return []
  }

  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.map((item, index) => ({
      uid: `${Date.now()}-${index}-${Math.random().toString(16).slice(2, 8)}`,
      name: String(item?.name || '').trim(),
      logo: String(item?.logo || '').trim()
    }))
  } catch {
    return []
  }
}

const syncPartnerRankings = () => {
  formState.partner_rankings = JSON.stringify(
    partnerRankings.value.map(item => ({
      name: String(item.name || '').trim(),
      logo: String(item.logo || '').trim()
    }))
  )
}

const addPartnerRanking = () => {
  partnerRankings.value.push({
    uid: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    name: '',
    logo: ''
  })
  syncPartnerRankings()
}

const removePartnerRanking = index => {
  partnerRankings.value.splice(index, 1)
  syncPartnerRankings()
}

const movePartnerRanking = (index, step) => {
  const targetIndex = index + step

  if (targetIndex < 0 || targetIndex >= partnerRankings.value.length) {
    return
  }

  const [currentItem] = partnerRankings.value.splice(index, 1)
  partnerRankings.value.splice(targetIndex, 0, currentItem)
  syncPartnerRankings()
}

const getPartnerLogoFileList = item => {
  if (!item.logo) {
    return []
  }

  return [{
    uid: item.uid,
    name: 'logo',
    status: 'done',
    url: resolveSettingImageUrl(item.logo)
  }]
}

const persistPartnerRankings = async () => {
  syncPartnerRankings()

  const res = await updateConfig({
    partner_rankings: formState.partner_rankings || '[]'
  })

  if (res.data.code !== 200) {
    throw new Error(res.data.message || '保存失败')
  }

  originalFormState.value = {
    ...originalFormState.value,
    partner_rankings: formState.partner_rankings
  }
}

const handlePartnerLogoUpload = async (item, { file, onSuccess, onError }) => {
  try {
    const res = await uploadImage(file)
    const uploadResult = res?.data ?? res

    if (uploadResult?.code !== 200 || !uploadResult?.data?.url) {
      throw new Error(uploadResult?.message || '图片上传失败')
    }

    item.logo = uploadResult.data.url
    await persistPartnerRankings()
    onSuccess(uploadResult.data)
    message.success('图片上传并保存成功')
  } catch (error) {
    message.error(error?.message || '图片上传失败')
    onError(error)
  }
}

const parseConfigValue = (config) => {
  const { value, type, key } = config

  if (!value) return type === 'boolean' ? false : ''

  switch (type) {
    case 'number':
      return parseFloat(value)
    case 'boolean':
      return ['true', '1', 1].includes(value)
    case 'json':
      try {
        return JSON.stringify(JSON.parse(value), null, 2)
      } catch {
        return value
      }
    case 'images':
      {
        const images = parseImageConfigValue(value)
        imageFiles[key] = createImageFileList(images)
        return JSON.stringify(images)
      }
    default:
      return value
  }
}

const fetchConfig = async () => {
  loading.value = true
  try {
    const res = await getAllConfig()
    if (res.data.code === 200) {
      const activeConfigs = (res.data.data || []).filter(config => config?.is_active)
      configData.value = ensureRequiredWebsiteConfigs(activeConfigs)

      configData.value.sort((a, b) => (a.sort) - (b.sort))

      const groupSortMap = {}
      configData.value.forEach(config => {
        if (!groupSortMap[config.group] || config.sort < groupSortMap[config.group]) {
          groupSortMap[config.group] = config.sort
        }
      })

      const uniqueGroups = [...new Set(configData.value.map(config => config.group))]
      const visibleGroups = uniqueGroups.filter(group => {
        if (group === 'faq') {
          return false
        }

        return getConfigsByGroup(group).some(config => {
          return !isCertificateLegacyConfig(config.key) && !isPageContentConfig(config.key) && config.key !== FAQ_ITEMS_KEY
        })
      })

      if (fullPageEditorConfigs.value.length) {
        visibleGroups.push(PAGE_CONTENT_GROUP)
        groupSortMap[PAGE_CONTENT_GROUP] = Math.min(
          ...fullPageEditorConfigs.value.map(config => Number(config.sort) || 9999)
        )
      }

      const nextGroups = visibleGroups.sort((a, b) => (groupSortMap[a] || 9999) - (groupSortMap[b] || 9999))
      configGroups.value = nextGroups

      configData.value.forEach(config => {
        formState[config.key] = parseConfigValue(config)
      })

      if (imageFiles[LANDING_HERO_POSTER_KEY]?.length) {
        imageFiles[LANDING_HERO_POSTER_KEY] = imageFiles[LANDING_HERO_POSTER_KEY].slice(0, 1)
        formState[LANDING_HERO_POSTER_KEY] = JSON.stringify(extractImageUrls(imageFiles[LANDING_HERO_POSTER_KEY]))
      }

      if (imageFiles[LANDING_STORY_IMAGES_KEY]?.length) {
        imageFiles[LANDING_STORY_IMAGES_KEY] = imageFiles[LANDING_STORY_IMAGES_KEY].slice(0, 4)
        formState[LANDING_STORY_IMAGES_KEY] = JSON.stringify(extractImageUrls(imageFiles[LANDING_STORY_IMAGES_KEY]))
      }

      partnerRankings.value = parsePartnerRankings(formState.partner_rankings)
      syncPartnerRankings()
      landingNavItems.value = parseLandingLinkItems(formState[LANDING_NAV_ITEMS_KEY])
      syncLandingNavItems()
      landingStoryCards.value = parseLandingStoryCards(formState[LANDING_STORY_CARDS_KEY])
      syncLandingStoryCards()
      landingFooterUsefulLinks.value = parseLandingLinkItems(formState[LANDING_FOOTER_USEFUL_LINKS_KEY])
      syncLandingFooterUsefulLinks()
      landingFooterCapabilities.value = parseLandingTextItems(formState[LANDING_FOOTER_CAPABILITIES_KEY])
      syncLandingFooterCapabilities()
      landingFooterSocialLinks.value = parseLandingLinkItems(formState[LANDING_FOOTER_SOCIAL_LINKS_KEY])
      syncLandingFooterSocialLinks()
      processReviewQuestions.value = parseProcessReviewQuestions(formState[PROCESS_REVIEW_QUESTIONS_KEY])
      syncProcessReviewQuestions()
      faqItems.value = parseFaqItems(formState[FAQ_ITEMS_KEY])
      syncFaqItems()
      ensureMaintenancePageContentValue()
      ensureCertificatePageContentValue()
      ensureFaqPageContentValue()
      processReviewCurrentPage.value = 1
      normalizeProcessReviewQuestionPage()

      originalFormState.value = { ...formState }
    } else {
      message.error(res.data.message)
    }
  } catch (error) {
    message.error(`获取配置失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  loading.value = true
  try {
    if (partnerRankingConfig.value) {
      const hasEmptyPartnerName = partnerRankings.value.some(item => !String(item.name || '').trim())

      if (hasEmptyPartnerName) {
        message.error('合作商名称不能为空')
        return
      }

      syncPartnerRankings()
    }

    if (processReviewQuestionConfig.value) {
      syncProcessReviewQuestions()

      const normalizedQuestions = normalizeProcessReviewQuestions()
      if (!normalizedQuestions.length) {
        message.error('流程页Step2题库至少需要一个问题')
        return
      }

      const invalidQuestionIndex = normalizedQuestions.findIndex(item => !item.question || !item.answers.length)
      if (invalidQuestionIndex !== -1) {
        message.error(`问题${invalidQuestionIndex + 1} 需要填写问题内容，并至少保留一个答案`)
        return
      }
    }

    if (landingStoryCardsConfig.value) {
      syncLandingStoryCards()

      const normalizedCards = normalizeLandingStoryCards()
      const invalidCardIndex = normalizedCards.findIndex(item => !item.metric || !item.caption)
      if (invalidCardIndex !== -1) {
        message.error(`案例卡片${invalidCardIndex + 1} 需要填写指标和说明`)
        return
      }
    }

    if (landingNavItemsConfig.value) {
      syncLandingNavItems()

      const normalizedNavItems = normalizeLandingLinkItems(landingNavItems.value)
      const invalidNavIndex = normalizedNavItems.findIndex(item => !item.label)
      if (invalidNavIndex !== -1) {
        message.error(`顶部导航${invalidNavIndex + 1} 需要填写名称`)
        return
      }
    }

    if (landingFooterUsefulLinksConfig.value) {
      syncLandingFooterUsefulLinks()

      const normalizedUsefulLinks = normalizeLandingLinkItems(landingFooterUsefulLinks.value)
      const invalidUsefulLinkIndex = normalizedUsefulLinks.findIndex(item => !item.label)
      if (invalidUsefulLinkIndex !== -1) {
        message.error(`页脚常用链接${invalidUsefulLinkIndex + 1} 需要填写名称`)
        return
      }
    }

    if (landingFooterCapabilitiesConfig.value) {
      syncLandingFooterCapabilities()

      const normalizedCapabilities = normalizeLandingTextItems(landingFooterCapabilities.value)
      if (landingFooterCapabilities.value.length && normalizedCapabilities.length !== landingFooterCapabilities.value.length) {
        message.error('页脚能力列表存在空文案，请补全后再保存')
        return
      }
    }

    if (landingFooterSocialLinksConfig.value) {
      syncLandingFooterSocialLinks()

      const normalizedSocialLinks = normalizeLandingLinkItems(landingFooterSocialLinks.value)
      const invalidSocialLinkIndex = normalizedSocialLinks.findIndex(item => !item.label)
      if (invalidSocialLinkIndex !== -1) {
        message.error(`页脚社媒${invalidSocialLinkIndex + 1} 需要填写显示文案`)
        return
      }
    }

    if (faqConfig.value) {
      ensureFaqPageContentValue()

      if (!String(formState[FAQ_PAGE_CONTENT_KEY] || '').trim()) {
        message.error('FAQ 页面内容不能为空')
        return
      }
    }

    if (!String(formState[SITE_MAINTENANCE_PAGE_CONTENT_KEY] || '').trim()) {
      ensureMaintenancePageContentValue()
    }

    if (maintenancePageContentConfig.value && !String(formState[SITE_MAINTENANCE_PAGE_CONTENT_KEY] || '').trim()) {
      message.error('维护页内容不能为空')
      return
    }

    const autoOrderMinPercent = parseFloat(formState.auto_order_price_min_percent)
    const autoOrderMaxPercent = parseFloat(formState.auto_order_price_max_percent)
    if (
      Object.prototype.hasOwnProperty.call(formState, 'auto_order_price_min_percent')
      || Object.prototype.hasOwnProperty.call(formState, 'auto_order_price_max_percent')
    ) {
      if (
        !Number.isFinite(autoOrderMinPercent)
        || !Number.isFinite(autoOrderMaxPercent)
        || autoOrderMinPercent <= 0
        || autoOrderMaxPercent <= 0
        || autoOrderMinPercent > 100
        || autoOrderMaxPercent > 100
      ) {
        message.error('刷单金额占比需在 0 到 100 之间')
        return
      }

      if (autoOrderMinPercent > autoOrderMaxPercent) {
        message.error('非卡单商品金额最低占比不能大于最高占比')
        return
      }
    }

    if (!String(formState[CERTIFICATE_PAGE_CONTENT_KEY] || '').trim()) {
      ensureCertificatePageContentValue()
    }

    const submitData = {}

    for (const [key, value] of Object.entries(formState)) {
      const config = configData.value.find(c => c.key === key)
      if (!config) continue

      if (config.type === 'json' && typeof value === 'string') {
        try {
          JSON.parse(value)
          submitData[key] = value
        } catch {
          message.error(`${config.description ?? key} 的JSON格式不正确`)
          return
        }
      } else if (config.type === 'images') {
        const normalizedImages = key === LANDING_HERO_POSTER_KEY
          ? extractImageUrls(imageFiles[key]).slice(0, 1)
          : (key === LANDING_STORY_IMAGES_KEY
            ? extractImageUrls(imageFiles[key]).slice(0, 4)
            : extractImageUrls(imageFiles[key]))
        submitData[key] = JSON.stringify(normalizedImages)
        formState[key] = submitData[key]
      } else if (config.type === 'boolean') {
        submitData[key] = value ? '1' : '0'
      } else {
        submitData[key] = String(value ?? '')
      }
    }

    const res = await updateConfig(submitData)
    if (res.data.code === 200) {
      message.success('保存成功')
      originalFormState.value = { ...formState }
    } else {
      message.error(res.data.message ?? '保存失败')
    }
  } catch (error) {
    message.error(`保存失败: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const resetSettings = () => {
  Object.assign(formState, originalFormState.value)
  configData.value.forEach(config => {
    if (config.type === 'images') {
      imageFiles[config.key] = createImageFileList(parseImageConfigValue(formState[config.key]))
    }
  })
  if (imageFiles[LANDING_HERO_POSTER_KEY]?.length) {
    imageFiles[LANDING_HERO_POSTER_KEY] = imageFiles[LANDING_HERO_POSTER_KEY].slice(0, 1)
  }
  if (imageFiles[LANDING_STORY_IMAGES_KEY]?.length) {
    imageFiles[LANDING_STORY_IMAGES_KEY] = imageFiles[LANDING_STORY_IMAGES_KEY].slice(0, 4)
  }
  partnerRankings.value = parsePartnerRankings(formState.partner_rankings)
  landingNavItems.value = parseLandingLinkItems(formState[LANDING_NAV_ITEMS_KEY])
  syncLandingNavItems()
  landingStoryCards.value = parseLandingStoryCards(formState[LANDING_STORY_CARDS_KEY])
  syncLandingStoryCards()
  landingFooterUsefulLinks.value = parseLandingLinkItems(formState[LANDING_FOOTER_USEFUL_LINKS_KEY])
  syncLandingFooterUsefulLinks()
  landingFooterCapabilities.value = parseLandingTextItems(formState[LANDING_FOOTER_CAPABILITIES_KEY])
  syncLandingFooterCapabilities()
  landingFooterSocialLinks.value = parseLandingLinkItems(formState[LANDING_FOOTER_SOCIAL_LINKS_KEY])
  syncLandingFooterSocialLinks()
  processReviewQuestions.value = parseProcessReviewQuestions(formState[PROCESS_REVIEW_QUESTIONS_KEY])
  syncProcessReviewQuestions()
  faqItems.value = parseFaqItems(formState[FAQ_ITEMS_KEY])
  syncFaqItems()
  ensureMaintenancePageContentValue()
  ensureCertificatePageContentValue()
  ensureFaqPageContentValue()
  processReviewCurrentPage.value = 1
  normalizeProcessReviewQuestionPage()
  message.info('已重置为上次保存的值')
}

// 获取文本预览（去除HTML标签，限制长度）
const getTextPreview = (htmlContent) => {
  if (!htmlContent) return ''
  const textContent = htmlContent.replace(/<[^>]*>/g, '')
  return textContent.length > 50 ? textContent.substring(0, 50) + '...' : textContent
}

const openRichEditor = (key, title) => {
  destroyRichEditor()
  currentEditKey.value = key
  currentEditTitle.value = title
  tempRichContent.value = normalizeRichContentForEditor(formState[key] || '')
  richEditorSessionKey.value += 1
  richEditorVisible.value = true
}

// 保存富文本内容
const saveRichContent = () => {
  if (currentEditKey.value) {
    formState[currentEditKey.value] = normalizeRichContentForStorage(tempRichContent.value)
  }

  destroyRichEditor()
  richEditorVisible.value = false
  tempRichContent.value = ''
  currentEditKey.value = ''
  currentEditTitle.value = ''
  message.success('内容已保存')
}

const cancelRichEdit = () => {
  destroyRichEditor()
  richEditorVisible.value = false
  tempRichContent.value = ''
  currentEditKey.value = ''
  currentEditTitle.value = ''
}

const handleCreated = (editor) => {
  if (editorRef.value && editorRef.value !== editor) {
    destroyRichEditor()
  }

  editorRef.value = editor
}

onBeforeUnmount(() => {
  destroyRichEditor()
})

watch([processReviewCurrentPage, processReviewPageSize], () => {
  normalizeProcessReviewQuestionPage()
})

onMounted(() => {
  fetchConfig()
})
</script>

<style scoped>
.settings-container {
  padding: 24px;
}

.settings-card {
  margin-bottom: 24px;
}

.settings-page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.settings-page-title {
  color: #0f172a;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
}

.settings-page-description {
  margin-top: 6px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

.settings-form {
  max-width: 100%;
  padding-left: 0;
  margin-left: 0;
}

:deep(.ant-tabs-content) {
  padding-left: 0;
}

:deep(.ant-form-item) {
  margin-bottom: 24px;
  padding-right: 20%;
}

:deep(.ant-tabs-nav) {
  margin-left: 0;
  padding-left: 0;
}

.ant-form-item {
  margin-bottom: 24px;
}

:deep(.ant-form-item-explain) {
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}

.form-actions {
  display: flex;
  justify-content: flex-start;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
  padding-left: 24px;
}

.rich-editor-modal {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  overflow: hidden;
}

.text-input-wrapper {
  cursor: pointer;
}

.text-input-wrapper:hover .ant-input {
  border-color: #4096ff;
}

.media-upload-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.media-upload-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.settings-video-preview {
  width: min(100%, 360px);
  max-height: 220px;
  border-radius: 12px;
  background: #000000;
  box-shadow: inset 0 0 0 1px #e5e7eb;
}

.media-upload-path {
  font-size: 12px;
  line-height: 1.6;
  color: #64748b;
  word-break: break-all;
}

.event-config-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-right: 24px;
}

.event-rule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.event-rule-card,
.event-condition-card,
.checkin-reward-card,
.checkin-notice-card {
  border-radius: 12px;
  background: #f8fafc;
  box-shadow: inset 0 0 0 1px #e5e7eb;
}

.checkin-config-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-right: 24px;
}

.checkin-reward-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.maintenance-config-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-right: 24px;
}

.maintenance-section-card {
  border-radius: 12px;
  background: #f8fafc;
  box-shadow: inset 0 0 0 1px #e5e7eb;
}

.maintenance-section-description {
  margin-bottom: 16px;
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
}

.maintenance-config-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.maintenance-form-item {
  margin-bottom: 0;
}

.maintenance-form-item-full {
  grid-column: 1 / -1;
}

.website-config-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-right: 24px;
}

.website-section-card {
  border-radius: 12px;
  background: #f8fafc;
  box-shadow: inset 0 0 0 1px #e5e7eb;
}

.website-section-description {
  margin-bottom: 16px;
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
}

.website-section-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.website-form-item {
  margin-bottom: 0;
}

.website-form-item-full {
  grid-column: 1 / -1;
}

.process-review-config-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-right: 24px;
}

.process-review-section-card {
  border-radius: 12px;
  background: #f8fafc;
  box-shadow: inset 0 0 0 1px #e5e7eb;
}

.process-review-section-description {
  margin-bottom: 16px;
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
}

.page-content-config-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-right: 24px;
}

.page-content-section-card {
  border-radius: 12px;
  background: #f8fafc;
  box-shadow: inset 0 0 0 1px #e5e7eb;
}

.page-content-section-description {
  margin-bottom: 16px;
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
}

.page-content-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-content-editor-trigger {
  width: 100%;
}

.partner-config-layout {
  padding-right: 24px;
}

.partner-list-card {
  border-radius: 12px;
  background: #f8fafc;
  box-shadow: inset 0 0 0 1px #e5e7eb;
}

.partner-list-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.partner-ranking-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.partner-ranking-item {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 84px;
  gap: 16px;
  align-items: start;
  padding: 16px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px #e5e7eb;
}

.partner-ranking-index {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #e0ecff;
  color: #245fa8;
  font-weight: 700;
}

.partner-ranking-fields {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 140px;
  gap: 16px;
}

.partner-ranking-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.partner-logo-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.review-question-config {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-question-summary {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 14px;
  background: linear-gradient(135deg, #eff6ff, #f8fafc);
  box-shadow: inset 0 0 0 1px #dbeafe;
}

.review-question-summary-main {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.review-question-summary-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.review-question-summary-stats {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.review-question-stat {
  min-width: 88px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: inset 0 0 0 1px #dbeafe;
}

.review-question-stat-value {
  font-size: 20px;
  line-height: 1;
  font-weight: 700;
  color: #1d4ed8;
}

.review-question-stat-label {
  margin-top: 6px;
  font-size: 12px;
  color: #64748b;
}

.review-question-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.review-question-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.review-question-description {
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
}

.review-question-toolbar-tip {
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
}

.review-question-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-question-pagination {
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
}

.review-question-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: #f8fafc;
  box-shadow: inset 0 0 0 1px #e5e7eb;
}

.review-question-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.review-question-header-main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.review-question-index {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  padding: 4px 10px;
  border-radius: 999px;
  background: #dbeafe;
}

.review-question-answer-count {
  font-size: 12px;
  color: #64748b;
}

.review-question-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 4px;
}

.review-question-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.review-question-field-label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.review-question-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 4px;
  border-top: 1px dashed #dbe3ef;
}

.review-answer-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.review-answer-label {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
}

.review-answer-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-answer-item {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px #e2e8f0;
}

.review-answer-index {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #e2e8f0;
  font-size: 12px;
  font-weight: 700;
  color: #334155;
}

.review-answer-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 4px;
}

.review-question-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 0;
}

.process-review-import-modal {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.process-review-import-help {
  padding: 16px;
  border-radius: 12px;
  background: #f8fafc;
  box-shadow: inset 0 0 0 1px #e2e8f0;
}

.process-review-import-help-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
}

.process-review-import-help-text {
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
  margin-bottom: 12px;
}

.process-review-import-example {
  margin: 0;
  padding: 14px 16px;
  border-radius: 10px;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 12px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

.process-review-import-mode {
  align-self: flex-start;
}

.landing-config-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-right: 24px;
}

.landing-section-card {
  border-radius: 12px;
  background: #f8fafc;
  box-shadow: inset 0 0 0 1px #e5e7eb;
}

.landing-section-description {
  margin-bottom: 16px;
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
}

.landing-section-grid,
.landing-story-card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.landing-form-item {
  margin-bottom: 0;
}

.landing-form-item-full {
  grid-column: 1 / -1;
}

.landing-story-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.landing-story-card-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.landing-story-card-item {
  padding: 18px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px #e5e7eb;
}

.landing-story-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.landing-story-card-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.landing-story-card-preview {
  width: 100%;
  height: 104px;
  object-fit: cover;
  border-radius: 8px;
}

.landing-footer-config-block + .landing-footer-config-block {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.landing-footer-config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.about-config-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-right: 24px;
}

.about-section-card {
  border-radius: 12px;
  background: #f8fafc;
  box-shadow: inset 0 0 0 1px #e5e7eb;
}

.about-section-description {
  margin-bottom: 16px;
  font-size: 13px;
  line-height: 1.6;
  color: #64748b;
}

.about-section-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.about-section-grid.single {
  grid-template-columns: minmax(0, 1fr);
}

.about-form-item {
  margin-bottom: 0;
}

.about-form-item-full {
  grid-column: 1 / -1;
}

.event-form-item {
  margin-bottom: 16px;
}

.event-form-item:last-child {
  margin-bottom: 0;
}

@media (max-width: 960px) {
  .settings-page-head {
    flex-direction: column;
  }

  .landing-section-grid,
  .landing-story-card-grid,
  .about-section-grid,
  .website-section-grid,
  .maintenance-config-grid,
  .partner-ranking-item,
  .partner-ranking-fields {
    grid-template-columns: 1fr;
  }
}
</style>
