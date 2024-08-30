'use strict'

const { PAD } = require('../../../constants/pad')
const { PREFIX } = require('../../../constants/prefix')
const { Connection } = require('../../../utils/blockchain')
const { generateId } = require('../../../utils/generate-id')

/**
 * supply-chain-record controller
 */

const { createCoreController } = require('@strapi/strapi').factories

const includes = {
  supplyChainRecord: 'api::supply-chain-record.supply-chain-record',
}

module.exports = createCoreController(
  'api::supply-chain-record.supply-chain-record',
  ({ strapi }) => ({
    // Scan QR + List All (status != Ongoing)
    async findArrivalProcess(ctx) {
      try {
        const userId = ctx.state.user.id
        const departureBatchIds = (
          await strapi.db
            .query('api::supply-chain-record.supply-chain-record')
            .findMany({
              where: {
                sender: {
                  id: userId,
                },
                arrivalBatchId: {
                  $notNull: true,
                },
              },
            })
        ).map((e) => e.arrivalBatchId)
        ctx.query.filters = {
          // @ts-ignore
          ...ctx.query?.filters,
          receiver: { id: { $eq: userId } },
          batchId: { $notIn: departureBatchIds },
        }
        const results = await super.find(ctx)
        return results
      } catch {
        return ctx.internalServerError('Something went wrong!')
      }
    },
    async findOneArrivalProcess(ctx) {
      try {
        const userId = ctx.state.user.id
        ctx.query.populate = ctx.query.populate
          ? [
              'receiver',
              ...(Array.isArray(ctx.query.populate)
                ? ctx.query.populate
                : ctx.query.populate.split(',')),
            ]
          : ['receiver']
        const results = await super.findOne(ctx)
        if (
          results.data.attributes &&
          (results.data.attributes.receiver.data == null ||
            results.data.attributes.receiver.data.id != userId)
        ) {
          return ctx.notFound()
        }
        return results
      } catch {
        return ctx.internalServerError('Something went wrong!')
      }
    },
    async arrivalProcess(ctx) {
      try {
        const userId = ctx.state.user.id
        // @ts-ignore
        ctx.request.body.data.receiver = userId
        // await super.update(ctx);
        return ctx.send(
          {
            data: true,
          },
          200
        )
      } catch {
        return ctx.internalServerError('Something went wrong!')
      }
    },
    // Update Departure Record -> Rejected/ Accepted
    async updateArrivalProcess(ctx) {
      return await strapi.db
        .transaction(async () => {
          const userId = ctx.state.user.id
          const batchId = ctx.params.id
          const { supplyChainRecord } = includes
          const row = await strapi.db.query(supplyChainRecord).findOne({
            where: { batchId },
            populate: ['receiver', 'departure_histories'],
          })
          if (!row) return ctx.notFound()
          // Update status Approved / Rejected
          if (
            row.receiver !== null &&
            row.receiver.id == userId &&
            !['Received', 'Rejected'].includes(row.deliveryStatus)
          ) {
            // @ts-ignore
            const bodyData = ctx.request.body.data
            const data = {
              // @ts-ignore
              ...ctx.request.body.data,
              receiver: row.receiver.id,
              transactionTime: new Date().toISOString(),
              // @ts-ignore
              scanResult: ctx.request.body.data.deliveryStatus,
              publishedAt: new Date().toISOString(),
            }
            const lastHistoryId =
              row.departure_histories[row.departure_histories.length - 1].id
            await strapi.db
              .query('api::departure-history.departure-history')
              .update({
                where: {
                  id: lastHistoryId,
                },
                data: {
                  scanResult: data.scanResult,
                },
              })
            const history = await strapi.db
              .query('api::departure-history.departure-history')
              .create({
                data: {
                  ...data,
                },
              })
            const updated = await strapi.db
              .query('api::supply-chain-record.supply-chain-record')
              .update({
                where: {
                  id: row.id,
                },
                populate: ['departure_histories'],
                data: {
                  ...bodyData,
                  arrivalTime: new Date().toISOString(),
                  departure_histories: {
                    connect: [history.id],
                    disconnect: [],
                  },
                },
              })
            bodyData.departureHistories = updated.departure_histories?.map(
              (e) => e.id
            )
            await Connection.contract.submitTransaction(
              'updateRecord',
              row.blockchainId,
              // @ts-ignore
              JSON.stringify(ctx.request.body.data)
            )
            await strapi.entityService.create(
              'api::log-blockchain.log-blockchain',
              {
                data: {
                  blockchainId: row.blockchainId,
                  channel: 'SupplyChainRecords',
                },
              }
            )
            return { data: true }
          } else {
            return ctx.forbidden()
          }
        })
        .catch(() => {
          return ctx.internalServerError('Something went wrong!')
        })
    },
    async deleteArrivalProcess() {
      // try {
      //   const userId = ctx.state.user.id
      // const id = ctx.params.id;
      // const { supplyChainRecord } = includes;
      // const row = await strapi.db
      //   .query(supplyChainRecord)
      //   .findOne({ where: { id }, populate: ["receiver"] });
      // if (row.receiver !== null && row.receiver.id == userId) {
      //   await super.delete(ctx);
      //   return ctx.send(
      //     {
      //       data: true,
      //     },
      //     200
      //   );
      // } else {
      //   return ctx.forbidden();
      // }
      return { data: true }
      // } catch {
      //   return ctx.internalServerError('Something went wrong!')
      // }
    },
    async findDepartureProcess(ctx) {
      try {
        const userId = ctx.state.user.id
        ctx.query.filters = {
          // @ts-ignore
          ...ctx.query.filters,
          sender: { id: { $eq: userId } },
        }
        const results = await super.find(ctx)
        return results
      } catch {
        return ctx.internalServerError('Something went wrong!')
      }
    },
    async findOneDepartureProcess(ctx) {
      try {
        const userId = ctx.state.user.id
        ctx.query.populate = ctx.query.populate
          ? [
              'sender',
              ...(Array.isArray(ctx.query.populate)
                ? ctx.query.populate
                : ctx.query.populate.split(',')),
            ]
          : ['sender']
        const result = await super.findOne(ctx)
        if (
          result.data.attributes &&
          (result.data.attributes.sender.data == null ||
            result.data.attributes.sender.data.id != userId)
        ) {
          return ctx.notFound()
        }
        return result
      } catch {
        return ctx.internalServerError('Something went wrong!')
      }
    },
    async departureProcess(ctx) {
      return await strapi.db
        .transaction(async () => {
          const userId = ctx.state.user.id
          // @ts-ignore
          const body = ctx.request.body
          body.data.sender = userId
          // 1st batch in the chain
          if (!body.data.arrivalBatchId) {
            const records = await strapi.entityService.findMany(
              'api::supply-chain-record.supply-chain-record',
              {
                sort: {
                  supplyChainId: 'desc',
                },
              }
            )
            let currentSupId = 0
            // Get the biggest num -> + 1
            if (records.length > 0) {
              currentSupId =
                +records[0].supplyChainId?.substring(PREFIX.SUPPLY_ID.length) ||
                0
            }
            body.data.supplyChainId = generateId(
              PREFIX.SUPPLY_ID,
              PAD.SUPPLY_ID,
              currentSupId + 1
            )
          } else {
            const record = await strapi.db
              .query('api::supply-chain-record.supply-chain-record')
              .findOne({
                where: {
                  batchId: body.data.arrivalBatchId,
                },
              })
            if (!record)
              return ctx.internalServerError('Invalid arrivalBatchId')
            body.data.supplyChainId = record.supplyChainId
          }
          const newRecord = await strapi.entityService.create(
            'api::supply-chain-record.supply-chain-record',
            {
              data: {
                ...body.data,
                publishedAt: new Date().toISOString(),
              },
            }
          )
          const batchId = generateId(
            PREFIX.BATCH_ID,
            PAD.BATCH_ID,
            +newRecord.id
          )
          body.data.batchId = batchId
          const batchDataString = JSON.stringify(body.data)
          const resultBytes = await Connection.contract.submitTransaction(
            'createRecord',
            batchDataString
          )
          const resultString = new TextDecoder().decode(resultBytes)
          const result = JSON.parse(resultString.toString())
          await strapi.entityService.create(
            'api::log-blockchain.log-blockchain',
            {
              data: {
                blockchainId: result.recordId,
                channel: 'SupplyChainRecords',
              },
            }
          )
          const updated = await strapi.entityService.update(
            'api::supply-chain-record.supply-chain-record',
            newRecord.id,
            {
              data: {
                batchId,
                blockchainId: result.recordId,
              },
            }
          )
          return { data: updated }
        })
        .catch(() => {
          return ctx.internalServerError('Something went wrong!')
        })
    },
    async updateDepartureProcess(ctx) {
      // Catch error blockchain
      return await strapi.db
        .transaction(async () => {
          const userId = ctx.state.user.id
          const id = ctx.params.id
          const { supplyChainRecord } = includes
          const row = await strapi.db.query(supplyChainRecord).findOne({
            where: { id },
            populate: ['sender', 'departure_histories'],
          })
          if (!row) return ctx.notFound()
          if (
            row.sender !== null &&
            row.sender.id == userId &&
            (row.deliveryStatus === 'Prepared' ||
              row.deliveryStatus === 'Rejected')
          ) {
            // @ts-ignore
            const data = ctx.request.body.data
            if (!data?.receiver) {
              await super.update(ctx)
              await Connection.contract.submitTransaction(
                'updateRecord',
                row.blockchainId,
                // @ts-ignore
                JSON.stringify(ctx.request.body.data)
              )
              await strapi.entityService.create(
                'api::log-blockchain.log-blockchain',
                {
                  data: {
                    blockchainId: row.blockchainId,
                    channel: 'SupplyChainRecords',
                  },
                }
              )
              return { data: true }
            }
            // Change receiver
            const history = await strapi.entityService.create(
              'api::departure-history.departure-history',
              {
                data: {
                  // @ts-ignore
                  receiver: ctx.request.body.data.receiver,
                  transactionTime: new Date().toISOString(),
                  scanResult: 'Ongoing',
                  publishedAt: new Date().toISOString(),
                },
              }
            )
            const updated = await strapi.db
              .query('api::supply-chain-record.supply-chain-record')
              .update({
                where: {
                  id: id,
                },
                populate: ['departure_histories'],
                data: {
                  receiver: data.receiver,
                  deliveryStatus: 'Ongoing',
                  departureTime: new Date().toISOString(),
                  departure_histories: {
                    connect: [history.id],
                    disconnect: [],
                  },
                },
              })
            data.deliveryStatus = 'Ongoing'
            data.departureHistories = updated?.departure_histories?.map(
              (e) => e.id
            )
            await Connection.contract.submitTransaction(
              'updateRecord',
              row.blockchainId,
              // @ts-ignore
              JSON.stringify(ctx.request.body.data)
            )
            await strapi.entityService.create(
              'api::log-blockchain.log-blockchain',
              {
                data: {
                  blockchainId: row.blockchainId,
                  channel: 'SupplyChainRecords',
                },
              }
            )
            return ctx.send({ data: true }, 200)
          } else {
            return ctx.forbidden()
          }
        })
        .catch(() => {
          return ctx.internalServerError('Something went wrong!')
        })
    },
    async deleteDepartureProcess(ctx) {
      return await strapi.db
        .transaction(async () => {
          const userId = ctx.state.user.id
          const id = ctx.params.id
          const { supplyChainRecord } = includes
          const row = await strapi.db
            .query(supplyChainRecord)
            .findOne({ where: { id }, populate: ['sender'] })
          if (!row) return ctx.notFound()
          if (
            row.sender !== null &&
            row.sender.id == userId &&
            row.deliveryStatus === 'Prepared'
          ) {
            await super.delete(ctx)
            await Connection.contract.submitTransaction(
              'deleteRecord',
              row.blockchainId
            )
            await strapi.entityService.create(
              'api::log-blockchain.log-blockchain',
              {
                data: {
                  blockchainId: row.blockchainId,
                  channel: 'SupplyChainRecords',
                },
              }
            )
            ctx.send({ data: true }, 200)
          } else {
            return ctx.forbidden()
          }
        })
        .catch(() => {
          return ctx.internalServerError('Something went wrong!')
        })
    },
    async viewSupplyChain(ctx) {
      const pageSize = +ctx.query.pageSize || 25
      const page = +ctx.query.page || 1
      const q = ctx.query.q || ''
      const order = ctx.query.order + '' || 'asc'
      const query = strapi.db
        .connection('supply_chain_records')
        .select('supply_chain_id')
        .min('created_at as created_at')
        .modify(function (queryBuilder) {
          if (q) {
            // @ts-ignore
            queryBuilder.whereRaw('LOWER(supply_chain_id) like ?', [
              // @ts-ignore
              `%${q.toLowerCase()}%`,
            ])
          }
        })
        .groupBy('supply_chain_id')
        .orderBy('created_at', order)
        .limit(pageSize)
        .offset(pageSize * (page - 1))

      const countQuery = strapi.db
        .connection('supply_chain_records')
        .countDistinct('supply_chain_id as total')
        .modify(function (queryBuilder) {
          if (q) {
            // @ts-ignore
            queryBuilder.whereRaw('LOWER(supply_chain_id) like ?', [
              // @ts-ignore
              `%${q.toLowerCase()}%`,
            ])
          }
        })
      return await Promise.all([query, countQuery])
        .then(([rows, [{ total }]]) => {
          const pagination = {
            page: page,
            pageSize: pageSize,
            pageCount: Math.ceil(+total / pageSize),
            total: +total,
          }

          const result = {
            data: rows,
            pagination: pagination,
          }
          return result
        })
        .catch(() => {
          return ctx.internalServerError('Something went wrong!')
        })
    },
  })
)
