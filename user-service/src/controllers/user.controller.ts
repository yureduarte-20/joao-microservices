import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef,
  param, patch,
  put, requestBody,
  response
} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import axios from 'axios';
import {Roles, Services, TokenServiceBindings, UserServiceBindings} from '../keys';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {JWTService} from '../services/jwt-service';
import {MyUserService} from '../services/user-service';
import {generateHash} from '../utils/password';
@authenticate({strategy: 'jwt'})
export class UserController {
  private problems_service_api = axios.create({
    baseURL: process.env.PROBLEM_SERVICE_API
  })
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
    @inject(AuthenticationBindings.CURRENT_USER)
    private user: UserProfile
  ) { }



  @get('/users/count')
  @response(200, {
    description: 'User model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(User) where?: Where<User>,
  ): Promise<Count> {
    return this.userRepository.count(where);
  }

  @get('/users')
  @response(200, {
    description: 'Array of User model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(User) filter?: Filter<User>,
  ): Promise<User[]> {
    return this.userRepository.find(filter);
  }

  @patch('/users')
  @response(200, {
    description: 'User PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
    @param.where(User) where?: Where<User>,
  ): Promise<Count> {
    if (user.password)
      user.password = await generateHash(user.password)
    if (user.responsibilities)
      user.responsibilities = [{role: Roles.STUDENT, service: Services.USER_SERVICE}, {role: Roles.STUDENT, service: Services.PROBLEM_SERVICE},
      {role: Roles.STUDENT, service: Services.CHAT_SERVICE}, {role: Roles.STUDENT, service: Services.JUDGE_SERVICE}]

    return this.userRepository.updateAll(user, where);
  }

  @get('/users/{id}')
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>
  ): Promise<User> {
    return this.userRepository.findById(id, filter);
  }

  @patch('/users/{id}')
  @response(204, {
    description: 'User PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
  ): Promise<void> {
    if (user.password)
      user.password = await generateHash(user.password)
    if (user.responsibilities)
      user.responsibilities = [{role: Roles.STUDENT, service: Services.USER_SERVICE}, {role: Roles.STUDENT, service: Services.PROBLEM_SERVICE},
      {role: Roles.STUDENT, service: Services.CHAT_SERVICE}, {role: Roles.STUDENT, service: Services.JUDGE_SERVICE}]
    await this.userRepository.updateById(id, user);
  }

  @put('/users/{id}')
  @response(204, {
    description: 'User PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() user: User,
  ): Promise<void> {
    if (user.password)
      user.password = await generateHash(user.password)
    if (user.responsibilities)
      user.responsibilities = [{role: Roles.STUDENT, service: Services.USER_SERVICE}, {role: Roles.STUDENT, service: Services.PROBLEM_SERVICE},
      {role: Roles.STUDENT, service: Services.CHAT_SERVICE}, {role: Roles.STUDENT, service: Services.JUDGE_SERVICE}]
    await this.userRepository.replaceById(id, user);
  }

  @del('/users/{id}')
  @response(204, {
    description: 'User DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userRepository.deleteById(id);
  }

  @get('/profile')
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {includeRelations: true}),
      },
    },
  })
  async profile(

  ): Promise<UserProfile> {
    return this.user
  }
}
